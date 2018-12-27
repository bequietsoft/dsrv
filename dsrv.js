var http = require('http');
var io = require('socket.io');

var path = require('path'); 
var fs = require('fs');

var port = 3000;
var root = __dirname;
var public = 'public';
var index = 'index.html';

// #region send utils

function sendFile(file) {
	var stat = fs.statSync(file);
    this.writeHead(200);
	fs.createReadStream(file).pipe(this);
}

function sendData(data) {
    this.writeHead(200);
	this.end(data);
}

var sfiles = [];
function scanDir(dir) {
	//console.log('dir: ' + dir);
	fs.readdirSync(dir).forEach(function(file) {
		var stat = fs.statSync("" + dir + "\\" + file);
		if (stat.isDirectory())
			return scanDir("" + dir + "\\" + file);
		else {
			//console.log('\t' + "" + dir + "\\" + file);
			return sfiles.push("" + dir + "\\" + file);
		}
	});
}

function send(item, response) {
	fs.stat(item, function(err, stat) {
		if(err == null) {
			if(stat.isFile()) {
				console.log('send file: ' + path.basename(item));
				response.sendFile(item);
			} else {
				let t = Date.now();
				let ignored = 0;
				sfiles = [];
				scanDir(item);
				let data = '';
				for(let i = 0; i < sfiles.length; i++) {
					let file = sfiles[i];
					if(path.basename(file)[0] == '~')
						ignored++;
					else 
						if(fs.statSync(file).isFile())
							data += fs.readFileSync(file, "utf8") + '\n\n';
				}
				let dt = (Date.now() - t) / 1000;
				console.log('send dir: ' + path.basename(item) + ' (build time ' + dt + 
					' sec., used part-files ' + (sfiles.length - ignored) + '/' + sfiles.length + ')');
				response.sendData(data);
			}
		} else { 
			console.log(err.message);
			response.send('');
		}
	});
}

// #endregion

var server = http.createServer(function (request, response) {
	response.sendFile = sendFile;
	response.sendData = sendData;
	
	// lock only for local host clients
	//console.log('Remote IP: ' + request.connection.remoteAddress);
	if(	request.connection.remoteAddress != '::1' &&
		request.connection.remoteAddress != '::ffff:127.0.0.1') {
			console.log('Remote IP: ' + request.connection.remoteAddress);
			return;
		}
		
	if(request.url == '/') request.url += index;
	send(path.join(root, public, request.url), response);
});

io(server).on('connection', function(socket) { 
	console.log('Socket connection ' + socket.id);
	socket.emit('tocli', { id: socket.id, data: 'accept' });
	
	socket.on('fromcli', function (msg) {
		console.log(msg.id + ': ' + msg.data);
		//io.emit('tocli', { id: socket.id, data: msg.data });
		socket.broadcast.emit('tocli', { id: socket.id, data: msg.data });
	});	
});

server.listen(port, function () {
	console.log('Development server listening on port ' + port + ':');
});