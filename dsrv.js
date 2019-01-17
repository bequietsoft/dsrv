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

function sleep( ms ) {
	ms += new Date().getTime();
	while (new Date() < ms) {}
} 

// #endregion

// #region sockets

function get_socket_index_by_id( id ) {
	for( let i = 0; i < sockets.length; i++) if( sockets[i].id == id ) return i;
	return -1;
}

// #endregion

// #region db

function db_get_items( path ) {
	try { return  db.getData( path ); } catch (error) {}
	return undefined;
}

function db_get_item_by_id( path, id ) {
	let items = db_get_items( path );
	let result = undefined;
	items.forEach( item => { if( item.id == id ) result = item; } );
	return result;
}

function db_clear( path ) {
	let items = db_get_items( path );
	if( Array.isArray( items ) ) 
		for( let i = 0; i < items.length; i++ ) db.delete( path + '[-1]' );
	else 
		db.delete( path );
}
 
function db_add_item( path, data ) {
	let item = db_get_item_by_id( path, data.id );
	//log( '   find exist item = ' + js(item) );
	if( item != undefined ) { 
		log( 'item with id ' + id + ' already exist: ' + js( item ) );
		return false; 
	}
	db.push( path + '[]', data );
	//log('ADD ' + now() );
	return true; 
}
 
function db_del_item_by_id( path, id ) {
	let items = db_get_items( path );
	for( let i = 0; i < items.length; i++ )
		if( items[i].id == id ) {
			db.delete( path + '[' + i + ']' );
			return true;
		}
	return false;
}

function db_update_path( path ) {
	if( db_get_items( path ) == undefined ) 
		db.push( path, [] );
	else 
		db_clear( path );
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
	db_update_path( connections_path );
	setInterval( update, 5000 );
});

function update() {
	
	//log( 'update ' + now() );
	let connections = db_get_items( connections_path );
	if( connections != undefined ) 
		if( connections.length != undefined ) 
			for ( let i = 0; i < connections.length; i++ ) {
				let connection = connections[i];
				let dt = Date.now() - Date.parse( connection.time );
				
				if( dt > 5000 ) {
					let si = get_socket_index_by_id( connection.id );
					if( si != -1 ) sockets[si].emit( 'tocli', { type: 'ping', id: connection.id } );
				}
				
				if( dt > 30000 ) {
					log( 'kill connection ' + connection.id + ' by timeout' );
					db.delete( connections_path + '[' + i + ']' );
					break;
				}
			}
}

io( server ).on( 'connection', function( socket ) { 

	log( 'open connection ' + socket.id );
	sockets.push( socket );
	socket.emit( 'tocli', { type: 'id', id: socket.id } );
	
	socket.on( 'fromcli', function ( data ) {
		
		let connection = db_get_item_by_id( connections_path, data.id );
		//log( connection );

		switch( data.type ) {

			// #region
			case 'login': {
				let connections = db_get_items( connections_path );
				users.forEach( user => {
					
					if( user.state == 'logout' && user.name == data.name ) {
						user.state = 'login';
						user.socket = socket;
						user.hash = rk(64);
						//log( 'user "' + user.name + '" state = ' + user.state );
						socket.emit( 'tocli', { type: 'hash', hash: user.hash } );
					}

					if( user.state == 'login' && user.socket.id == data.id && 
						data.hash == user.hash + user.pass ) {
						user.state = 'auth';
						user.socket = socket;
						user.hash = undefined;
						log( 'user "' + user.name + '" login' );
						socket.emit( 'tocli', { type: 'auth' } );
					}
				});
				break;
			}
			
			case 'logout': {
				users.forEach( user => {
					if( user.state == 'auth' && user.id == socket.id ) {
						user.state = 'logout';
						user.socket = undefined;
						log( 'user "' + user.name + '" logout' );
					}
				});
				break;
			}

			case 'message': {
				let sender = getUser( data.id );
				log( sender.name + ' message "' + data.text + '"' );
				//socket.broadcast.emit( 'tocli', data );
				users.forEach( user => { 
					if( user.state == 'auth' && user.name != sender.name )
						user.socket.emit( 'tocli', { name: sender.name, type: 'message', text: data.text } );
				});
				break; 
			}
			// #endregion
 
			case 'id': {
 
				if( connection == undefined ) {
					// if( data.text == 'new' )
					// 	log('client reset update connection ' + socket.id);
					// else 
					// 	log('server reset update connection ' + socket.id);
					
					db_add_item( connections_path, { time: now(), id: socket.id, name: 'anonimous' } );
				} 

				if( data.text == 'update' ) {
					let connections = db_get_items( connections_path );
					for( let i = 0; i < connections.length; i++ ) {
						let connection = connections[i];
						if( connection.id == data._id ) {
							connection.time = now();
							connection.id = socket.id;
							db.delete( connections_path + '[' + i + ']' );
							//db.push( connections_path + '[]', connection );
							//log( 'ID ' + data._id + ' > ID ' + socket.id );
							break; 
						}
					} 
				}

				break;
			}

			case 'pong': {
				let connections = db_get_items( connections_path );
				for( let i = 0; i < connections.length; i++ ) {
					let connection = connections[i];
					if( connection.id == data.id ) {
						connection.time = now();
						db.delete( connections_path + '[' + i + ']' );
						db.push( connections_path + '[]', connection );
						// log( '\tchange ' + connection.id + ' time' );
						break;
					}
				}
				break;
			}

			default: {
				log( socket.id + ' undefined data type' );
				break;
			}
		}
		
	});

	socket.on( 'disconnect', function( data ) {
		log( 'close connection ' + socket.id + ': ' + js(data) );
		db_del_item_by_id( connections_path, socket.id );
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



