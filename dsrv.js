var http = require( 'http' );
var io = require( 'socket.io' );

var path = require( 'path' ); 
var fs = require( 'fs' );

require('./server/tools.js')();
require('./server/db.js')();

var debug = true;
var send_show = false;

var port = 3000;
var root = __dirname;
var public_dir = 'public';
var index = 'index.html';
var connections_path = '/connections';

var sockets = [];

// #region send

function sendFile( file ) {
    this.writeHead( 200 );
	fs.createReadStream( file ).pipe( this );
}

function sendData( data ) {
	this.writeHead( 200 );
	data = data.replace( 'App.debug = undefined', 'App.debug = ' + debug );
	this.end( data );
}

var sfiles = [];
function scanDir( dir ) {
	fs.readdirSync( dir ).forEach( function( file ) {
		var stat = fs.statSync( "" + dir + "\\" + file );
		if( stat.isDirectory() )
			return scanDir( "" + dir + "\\" + file );
		else 
			return sfiles.push( "" + dir + "\\" + file );
	});
}

function send( item, response ) {
	fs.stat( item, function( err, stat ) {
		if( err == null ) {
			if( stat.isFile() ) {
				if( send_show ) log( 'send file: ' + path.basename(item) );
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
				if( send_show ) log( 'send dir: ' + path.basename( item ) + ' (build time ' + dt + 
					' sec., used part-files ' + ( sfiles.length - ignored ) + '/' + sfiles.length + ')' );
				response.sendData( data );
			}
		} else { 
			log( err.message );
			response.send( '' );
		}
	});
}

// #endregion

// #region sockets

function get_socket_index_by_id( id ) {
	for( let i = 0; i < sockets.length; i++) if( sockets[i].id == id ) return i;
	return -1;
}

function socket_send( id, data ) {
	let index = get_socket_index_by_id( id );
	if( index == -1 ) return;
	sockets[ index ].emit( 'tocli', data );
}

function socket_broadcast( id, data ) {
	let index = get_socket_index_by_id( id );
	if( index == -1 ) return;
	sockets[ index ].broadcast.emit( 'tocli', data );
}

// #endregion

var server = http.createServer( function ( request, response ) {
	
	response.sendFile = sendFile;
	response.sendData = sendData;
	
	if( debug ) {
		// lock only for local host clients
		if(	request.connection.remoteAddress != '::1' &&
			request.connection.remoteAddress != '::ffff:127.0.0.1') {
				log('Remote IP: ' + request.connection.remoteAddress);
				return;
			}
	}
		
	if( request.url == '/' ) request.url += index;
	send( path.join( root, public_dir, request.url ), response );
});
 
server.listen( port, function () {
	log( 'development server listening on port ' + port + ':' );
	db_update_path( connections_path );
	
	//setInterval( update_connections, 15000 );
});

function update_connections() {

	let connections = db_get_items( connections_path );
	if( connections != undefined ) 
		if( connections.length != undefined ) 
			for ( let i = 0; i < connections.length; i++ ) {
				let connection = connections[i];
				let dt = Date.now() - Date.parse( connection.time );
				
				if( dt > 5000 ) {
					let si = get_socket_index_by_id( connection.id );
					if( si != -1 ) 
						sockets[si].emit( 'tocli', 
						{ type: 'ping', id: connection.id } );
				}
				
				if( dt > 30000 ) {
					log( 'kill connection ' + connection.id + ' by timeout' );
					//db.delete( connections_path + '[' + i + ']' );
					db_del_item_by_id( connections_path, connection.id );
					break;
				}
			}
		
}

function get_login_connections() {
	let items = db_get_items( connections_path );
	let room = [];
	if( items != undefined ) {
		log( 'items.length = ' +  items.length );
		for( let i = 0; i < items.length; i++ )
			if( items[i].state == 'login') room.push( { name: items[i].name } );
	}
	else room = undefined;
	return room;
}

io( server ).on( 'connection', function( socket ) { 

	log( 'open connection ' + socket.id );
	socket.emit( 'tocli', { type: 'id', id: socket.id, room: get_login_connections() } );
	sockets.push( socket );

	socket.on( 'fromcli', function ( data ) {
		
		let connection = db_get_item_by_id( connections_path, data.id );
		
		switch( data.type ) {

			case 'login': {
				if( connection != undefined )
					if( connection.id == socket.id && connection.state == 'logout' )
						if( data.id == socket.id && data.name != undefined ) {
							let message = { type: 'login', name: data.name };
							connection.state = 'login';
							connection.name = data.name;
							connection.time = now();
							db_rewrite( connections_path, connection.id, connection );
							socket_broadcast( connection.id, message );
							socket_send( connection.id, message );
							log( data.name + ': login' );
						}
				break;
			}

			case 'logout': {
				if( connection != undefined )
					if( connection.id == socket.id && connection.state == 'login' )
						if( data.id == socket.id && data.name != undefined ) {
							let message = { type: 'logout', name: data.name };
							connection.state = 'logout';
							connection.name = 'anonimous';
							//connection.storage = [];
							connection.time = now();
							db_rewrite( connections_path, connection.id, connection );
							socket_broadcast( connection.id, message );
							socket_send( connection.id, message );
							log( data.name + ': logout' );
						}
				break;
			}
			
			case 'id': {
 
				if( connection == undefined ) {
					let connection = { 
						time: now(), 
						id: socket.id, 
						name: 'anonimous', 
						state: 'logout', 
						//storage: [] 
					};
					db_add_item( connections_path, connection );
				} 

				if( data.text == 'update' ) {
					socket_broadcast( socket.id, { type: 'logout', name: data.name } );
					db_del_item_by_id( connections_path, data._id );
				}

				break;
			}

			case 'pong': {
				connection.time = now();
				db_rewrite( connections_path, data.id, connection ); // update time
				break;
			}

			case 'message': {
				if( connection != undefined ) {
					log( connection.name + ': ' + data.text );
					let message = { type: 'message', name: connection.name, text: data.text };
					socket_broadcast( connection.id, message );
					socket_send( connection.id, message );
				}
				break; 
			}

			case 'vector': {
				log( js(data) );
				socket_broadcast( connection.id, data );
				break;
			}

			// case 'json': {
				
			// 	if( connection != undefined ) {
			// 		let update = false;
			// 		connection.storage.forEach( element => {
			// 			if( element.item == data.item ) {
			// 				element.value = data.value;
			// 				//log( connection.name + ': ' + data.item + ' update');
			// 				update = true;
			// 			} 
			// 		});
			// 		if( !update ) {
			// 			connection.storage.push( { item: data.item, value: data.value } ); 
			// 			//log( connection.name + ': ' + data.item + ' create');
			// 		}
			// 		db_rewrite( connections_path, data.id, connection );

			// 		if( data.broadcast == 'all' ) {
			// 			//log( js(data) );
			// 			socket_broadcast( connection.id, 'tocli', data );
			// 		}
			// 	}
			// }

			default: {
				//log( socket.id + ': ' + js(data) );
				break;
			}
		}
		
	});

	socket.on( 'disconnect', function( data ) {
		log( 'close connection ' + socket.id + ': ' + js(data) );
		let message = { type: 'logout', name: data.name };
		socket_broadcast( socket.id, 'tocli', message );
		db_del_item_by_id( connections_path, socket.id );
	});

});



