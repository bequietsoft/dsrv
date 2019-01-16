var http = require( 'http' );
var io = require( 'socket.io' );

var path = require( 'path' ); 
var fs = require( 'fs' );

var jsondb = require( 'node-json-db' );
var db = new jsondb( "db", true, true );

var port = 3000;
var root = __dirname;
var public_dir = 'public';
var index = 'index.html';

// #region send

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

// #region tools

function mkdir( path ) {
	try {
		if( fs.existsSync( path ) ) return false;
		fs.mkdirSync( path );
		return true;
	} catch( err ) { return false; } 
}

// JSON stingify 
function js( obj ) {
	return JSON.stringify( obj );
}

// JSON parse
function jp( obj ) {
	return JSON.parse( obj );
}

// JSON copy
function jc( obj ) {
	return JSON.parse( JSON.stringify( obj ) );
}

// random float value
function ri( min = 0, max = 1 ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

// random string of digits (key)
function rk( length = 4 ) {
	let r = '';
	for( let i=0; i<length; i++ ) r += ri( 0, 9 );
	return r;
}

function log( message = undefined ) {
	if ( message == undefined ) message = '';
	console.log( message );
}

// #endregion

// #region db

function dbget( path ) {
	try { return  db.getData( path ); } catch (error) {}
	return undefined;
}

function getuser( id ) {
	let users = dbget("/users");
	//log('users: ' + js(users));
	users.forEach( user => { if( user.id == id ) return user; });
	return undefined;
}

function adduser( id, name ) {
	let user = getuser( id );
	//log('user: ' + js(user));
	if( user != undefined ) return false; 
	db.push( '/users/', { id: id, name: name } );
	return true; 
}

// #endregion  

var server = http.createServer( function ( request, response ) {
	
	response.sendFile = sendFile;
	response.sendData = sendData;
	
	// lock only for local host clients
	//console.log('Remote IP: ' + request.connection.remoteAddress);
	if(	request.connection.remoteAddress != '::1' &&
		request.connection.remoteAddress != '::ffff:127.0.0.1') {
			log('Remote IP: ' + request.connection.remoteAddress);
			return;
		}
		
	if( request.url == '/' ) request.url += index;
	send( path.join( root, public_dir, request.url ), response );
});
 
server.listen( port, function () {
	log( 'development server listening on port ' + port + ':' );
	if( dbget( '/users' ) == undefined ) db.push( '/users', {} );
});

io( server ).on( 'connection', function( socket ) { 

	log( 'socket connection ' + socket.id );
	if( adduser( socket.id, 'anonimous' ))
		//socket.emit( 'tocli', { type: 'id', id: socket.id } );
	
	socket.on( 'fromcli', function ( data ) {
		
		//console.log( socket.id + ' data:\n' + js(data) );

		switch( data.type ) {

			// case 'login':
			// 	users.forEach( user => {
					
			// 		if( user.state == 'logout' && user.name == data.name ) {
			// 			user.state = 'login';
			// 			user.socket = socket;
			// 			user.hash = rk(64);
			// 			//log( 'user "' + user.name + '" state = ' + user.state );
			// 			socket.emit( 'tocli', { type: 'hash', hash: user.hash } );
			// 		}

			// 		if( user.state == 'login' && user.socket.id == data.id && 
			// 			data.hash == user.hash + user.pass ) {
			// 			user.state = 'auth';
			// 			user.socket = socket;
			// 			user.hash = undefined;
			// 			log( 'user "' + user.name + '" login' );
			// 			socket.emit( 'tocli', { type: 'auth' } );
			// 		}
			// 	});
			// 	break;
			
			// case 'logout':
			// 	users.forEach( user => {
			// 		if( user.state == 'auth' && user.id == socket.id ) {
			// 			user.state = 'logout';
			// 			user.socket = undefined;
			// 			log( 'user "' + user.name + '" logout' );
			// 		}
			// 	});
			// 	break;

			// case 'message':
			// 	let sender = getUser( data.id );
			// 	log( sender.name + ' message "' + data.text + '"' );
			// 	//socket.broadcast.emit( 'tocli', data );
			// 	users.forEach( user => { 
			// 		if( user.state == 'auth' && user.name != sender.name )
			// 			user.socket.emit( 'tocli', { name: sender.name, type: 'message', text: data.text } );
			// 	});
			// 	break; 

			case 'id':
				log(data.id + ' >>> ' + socket.id );
				// users.forEach( user => { 
				// 	if( user.id == data.id ) {  }
				// });
				break;

			// case 'json':
			// 	break;
				
			default:
				log( socket.id + ' undefined data type' );
				break;
		}
		
	});

	// #region old code

	// let user = getUser( socket.id );
	// let user_path = path.join( root, users_dir, user.name );
	
	// if( user.name == 'anonymous' ) user_path = path.join( user_path, user.id );

	// // send default data for user
	// try {
	// 	let items = 0;
	// 	let bytes = 0;
	// 	fs.readdirSync( user_path ).forEach( item => {
	// 		let value = fs.readFileSync( path.join( user_path, item ), "utf8" );// + '\n\n';
	// 		if( item != undefined && value != undefined) {
	// 			//console.log( 'item = ' + item );
	// 			// console.log( 'value = ' + value );
	// 			if( value != '' )
	// 				socket.emit( 'tocli', { id: socket.id, type: 'json', item: item, value: value } );
	// 			else
	// 				socket.emit( 'tocli', { id: socket.id, type: 'function', item: item } );
	// 			items ++;
	// 			bytes += value.length();
	// 		}
	// 	});

	// 	if( items > 0 ) console.log( 'send ' + items + ' items (' + bytes + ' bytes) to ' + socket.id );
		
	// } catch( err ) { 
	// 	//	console.log( err ); 
	// }

	
	
	// socket.on( 'fromcli', function ( data ) {
	// 	let user = getUser( data.id );
	// 	let user_path = path.join( root, users_dir, user.name );
	// 	mkdir( user_path );
		
	// 	if( user.name == 'anonymous' ) {
	// 		user_path = path.join( user_path, user.id );
	// 		mkdir( user_path );
	// 	}

	// 	switch( data.type ) {

	// 		case 'text':
	// 			console.log( user.name + ': ' + data.text );
	// 			socket.broadcast.emit( 'tocli', data );
	// 			break;

	// 		case 'json':
	// 			//console.log( data.item );
	// 			fs.writeFileSync( user_path + '/' + data.item, data.value );
	// 			//socket.emit( 'tocli', { id: 'server', type: 'text', text: data.item } );
	// 			break;
			
	// 		case 'function':
	// 			console.log( user.name + ': ' + data.item );
	// 			fs.writeFileSync( user_path + '/' + data.item );
	// 			//socket.emit( 'tocli', { id: 'server', type: 'text', text: data.item } );
	// 			break;

	// 		case 'cmd':
	// 			if( data.text == 'reset' ) {
	// 				fs.readdirSync( user_path ).forEach( item => {
	// 					//console.log(user.id + '\t' + item);
	// 					//if( item != user.id ) 
	// 					fs.unlinkSync( path.join( user_path, item ));
	// 				});
	// 				//socket.emit( 'tocli', { id: 'server', type: 'text', text: data.text });
	// 			}

	// 			// TODO

	// 			break;

	// 		default:
	// 			console.log( data.id + ': undefined msg type ' + data.type );
	// 			break;
	// 	}

	// 	//io.emit( 'tocli', data );
	// 	//socket.broadcast.emit( 'tocli', data ); //{ id: socket.id, type: 'echo', masdata: msg.data } );
	// });
	
	// #endregion
});



