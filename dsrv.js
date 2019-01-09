var http = require('http');
var io = require('socket.io');

var path = require('path'); 
var fs = require('fs');

var port = 3000;
var root = __dirname;
var public_dir = 'public';
var users_dir = 'users';
var index = 'index.html';

var users = [];

// #region send utils

function sendFile( file ) {
	var stat = fs.statSync( file );
    this.writeHead( 200 );
	fs.createReadStream( file ).pipe( this );
}

function sendData( data ) {
    this.writeHead( 200 );
	this.end( data );
}

var sfiles = [];
function scanDir( dir ) {
	//console.log('dir: ' + dir);
	fs.readdirSync( dir ).forEach( function( file ) {
		var stat = fs.statSync( "" + dir + "\\" + file );
		if( stat.isDirectory() )
			return scanDir( "" + dir + "\\" + file );
		else {
			//console.log( '\t' + "" + dir + "\\" + file );
			return sfiles.push( "" + dir + "\\" + file );
		}
	});
}

function send( item, response ) {
	fs.stat( item, function( err, stat ) {
		if( err == null ) {
			if( stat.isFile() ) {
				console.log( 'send file: ' + path.basename(item) );
				response.sendFile( item );
			} else {
				let t = Date.now();
				let ignored = 0;
				sfiles = [];
				scanDir( item );
				let data = '';
				for( let i = 0; i < sfiles.length; i++ ) {
					let file = sfiles[i];
					if( path.basename( file )[0] == '~' )
						ignored++;
					else 
						if( fs.statSync(file).isFile() )
							data += fs.readFileSync( file, "utf8" ) + '\n\n';
				}
				let dt = ( Date.now() - t ) / 1000;
				console.log( 'send dir: ' + path.basename( item ) + ' (build time ' + dt + 
					' sec., used part-files ' + ( sfiles.length - ignored ) + '/' + sfiles.length + ')' );
				response.sendData( data );
			}
		} else { 
			console.log( err.message );
			response.send( '' );
		}
	});
}

// #endregion

var server = http.createServer( function ( request, response ) {
	
	response.sendFile = sendFile;
	response.sendData = sendData;
	
	// lock only for local host clients
	//console.log('Remote IP: ' + request.connection.remoteAddress);
	if(	request.connection.remoteAddress != '::1' &&
		request.connection.remoteAddress != '::ffff:127.0.0.1') {
			console.log('Remote IP: ' + request.connection.remoteAddress);
			return;
		}
		
	if( request.url == '/' ) request.url += index;
	send( path.join( root, public_dir, request.url ), response );
});

io( server ).on( 'connection', function( socket ) { 
	
	console.log( 'Socket connection ' + socket.id );
	socket.emit( 'tocli', { id: socket.id, type: 'accept' } );
	
	let user = getUser( socket.id );
	let user_path = path.join( root, users_dir, user.name );
	sfiles = [];
	scanDir( user_path );
	sfiles.forEach(item => {
		console.log(item);
		socket.emit( 'tocli', { id: socket.id, type: 'accept' } );
	});

	//send( path.join( root, public_dir, request.url ), response );

	socket.on( 'fromcli', function ( data ) {
		
		//let type = data.type || undefined;
		let user = getUser( data.id );
		let user_path = path.join( root, users_dir, user.name );//'./users/' + user.name;
		if( fs.existsSync( user_path ) == false ) fs.mkdirSync( user_path );

		// console.log( '  user.id   = ' + user.id );
		// console.log( '  user.name = ' + user.name );
		// console.log( '  user_path = ' + user_path );
		// console.log( '  data.type = ' + data.type );
		// console.log( '  data.link = ' + data.link );
		// console.log( '  text      = ' + data.text );

		switch( data.type ) {

			case 'text':
				console.log( data.id + ': ' + data.text );
				break;

			case 'json':
				console.log( data.id + ': ' + data.text.length + ' bytes JSON object' );
				fs.writeFileSync( user_path + '/' + data.link + '.json', data.text );
				break;

			default:
				console.log( data.id + ': undefined msg type ' + data.type );
				break;
		}

		//io.emit( 'tocli', data );
		socket.broadcast.emit( 'tocli', data );//{ id: socket.id, type: 'echo', masdata: msg.data } );
	} );	
} );

// // 
// function onerror(err) {
// 	if( err ) throw err;
// }

// 
function getUser( id ) {
	for( let i = 0; i < users.length; i++ ) if( users[i].id == id ) return users[i];
	return { id: undefined, name: 'anonymous' };
}

server.listen( port, function () {
	console.log( 'Development server listening on port ' + port + ':' );
} );