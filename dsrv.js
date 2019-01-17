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
var connections_path = '/connections';

var sockets = [];

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

function now() {
	let now = Date(Date.now());
	return now;//now.Hours + ':' + now.Minutes + ':' + now.Seconds;
}

// #endregion

// #region db

function dbget( path ) {
	try { return  db.getData( path ); } catch (error) {}
	return undefined;
}

function dbgetuser( id ) {
	let users = dbget("/users");
	let result = undefined;
	users.forEach( user => { 
		if( user.id == id ) result = user;
	});
	return result;
}

function dbclear( path ) {
	let item = dbget( path );
	if( Array.isArray( item ) ) 
		for( let i = 0; i < item.length; i++ ) db.delete( path + '[-1]' );
	else 
		db.delete( path );
}

function dbadduser( id, name ) {
	let user = dbgetuser( id );
	log('find user id ' + id + ' result = ' + js(user));
	if( user != undefined ) return false; 
	db.push( '/users[]', { time: now(), id: id, name: name } );
	return true; 
}

function dbdeluser( id ) {
	let users = dbget("/users");
	for( let i = 0; i < users.length; i++ )
		if( users[i].id == id ) {
			db.delete( '/users[' + i + ']' );
			return true;
		}
	return false;
}

function dblist( name ) {
	if( dbget( name ) == undefined ) 
		db.push( name, [] );
	else 
		dbclear( name );
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
	
	dblist( connections_path );

	setInterval( update, 5000 );
});

function getsocketindex( id ) {
	for( let i = 0; i < sockets.length; i++) if( sockets[i].id == id ) return i;
	return -1;
}

function update() {

	//log( 'update ' + now() );
	let users = dbget('/users');
	if( users != undefined ) 
		if( users.length != undefined ) {
			for ( let i = 0; i < users.length; i++ ) {
				
				let user = users[i];
				let dt = Date.now() - Date.parse(user.time);
				
				if( dt > 5000 ) {
					let si = getsocketindex( user.id );
					if( si != -1 ) 
						sockets[si].emit( 'tocli', { type: 'ping', id: user.id } );
				}
				
				if( dt > 30000 ) {
					log( 'kill old client ' + user.id );
					db.delete( '/users[' + i + ']' );
					break;
				}
			}
		}
}

io(server).on('connection', function(socket) { 

	log( 'socket connection ' + socket.id );
	
	sockets.push( socket );
	socket.emit( 'tocli', { type: 'id', id: socket.id } );
	
	socket.on( 'fromcli', function ( data ) {
		
		let user = dbgetuser( data.id );
		//log(user);

		switch( data.type ) {

			// #region
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
			// #endregion

			case 'id':

				if( user == undefined ) {
					if( data.text == 'new' )
						log('new (client reset): ' + socket.id);
					else 
						log('new (server reset): ' + socket.id);
					dbadduser( socket.id, 'anonimous' );
				} 

				if( data.text == 'update' ) {
					users = dbget('/users');
					//log('update: ' + data._id + ' to ' + socket.id);
					for( let i = 0; i < users.length; i++ ) {
						let user = users[i];
						if( user.id == data._id ) {
							user.time = now();
							user.id = socket.id;
							db.delete( '/users[' + i + ']' );
							db.push( '/users[]', user );
							log( 'change id ' + data._id + ' to ' + socket.id );
							break;
						}
					}
				}

				break;

			case 'pong':
				users = dbget('/users');
				for( let i = 0; i < users.length; i++ ) {
					let user = users[i];
					if( user.id == data.id ) {
						user.time = now();
						db.delete( '/users[' + i + ']' );
						db.push( '/users[]', user );
						//log( '\tchange time ' + user.id );
						break;
					}
				}
				break;

			default:
				log( socket.id + ' undefined data type' );
				break;
		}
		
	});

	socket.on( 'disconnect', function( data ) {
		log( 'socket disconnection ' + socket.id + ': ' + js(data) );
		dbdeluser( socket.id );
		//db.delete('/users', );
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



