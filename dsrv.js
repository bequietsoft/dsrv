var http = require( 'http' );
var io = require( 'socket.io' );

var path = require( 'path' ); 
var fs = require( 'fs' );

require('./server/tools.js')();
require('./server/db.js')();

var debug = true;
var only_localhost = true;
var show_send_log = false;
var show_conn_log = false;

var port = 3000;
var main_root = __dirname;
var client_root = 'public';
var default_page = 'index.html';
var connections_path = '/connections';
var objects_path = '/objects';

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

var sfiles = []; // ?...
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
				if( show_send_log ) log( 'send file: ' + path.basename(item) );
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
				if( show_send_log ) log( 'send dir: ' + path.basename( item ) + ' (build time ' + dt + 
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

function socket_send_objects( id, name ) {
	
	let items = db_get_items( objects_path ).
		filter( function( item ) { return item.name = name; });
	
	items.forEach( item => {
		socket_send( id, { type: 'object', name: name, object: item.object } );
	});

	if( items.length > 0 ) log( 'send ' + items.length + ' objects' ); 
}

// #endregion

var server = http.createServer( function ( request, response ) {
	
	response.sendFile = sendFile;
	response.sendData = sendData;
	
	if( only_localhost ) {
		// lock only for local host clients
		if(	request.connection.remoteAddress != '::1' &&
			request.connection.remoteAddress != '::ffff:127.0.0.1') {
				log('Remote IP: ' + request.connection.remoteAddress);
				return;
			}
	}
		
	if( request.url == '/' ) request.url += default_page;
	send( path.join( main_root, client_root, request.url ), response );
});
 
server.listen( port, function () {
	log( 'server listening on port ' + port + ':' );
	
	db_update_path( connections_path, [], true );
	db_update_path( objects_path, [], false );
	
	setInterval( update_connections, 5000 );
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
					db_del_item_by_id( connections_path, connection.id );
					break;
				}
			}
		
}

function get_login_connections() {
	let items = db_get_items( connections_path );
	let room = [];
	if( items != undefined ) {
		//log( 'items.length = ' +  items.length );
		for( let i = 0; i < items.length; i++ )
			if( items[i].state == 'login') room.push( { name: items[i].name } );
	}
	else room = undefined;
	return room;
}

io( server ).on( 'connection', function( socket ) { 

	if( show_conn_log ) log( 'open connection ' + socket.id );
	socket.emit( 'tocli', { type: 'id', id: socket.id, room: get_login_connections() } );
	sockets.push( socket );

	socket.on( 'fromcli', function ( data ) {
		
		let connection = db_get_item_by_id( connections_path, data.id );
		
		switch( data.type ) {

			case 'login': {

				if( connection != undefined ) {
					if( connection.id == socket.id && connection.state == 'logout' )
						if( data.id == socket.id && data.name != undefined ) {
							let message = { type: 'login', name: data.name, room: get_login_connections() };
							connection.state = 'login';
							connection.name = data.name;
							connection.time = now();
							db_rewrite( connections_path, connection.id, connection );
							socket_broadcast( connection.id, message );
							socket_send( connection.id, message );
							socket_send_objects( connection.id, 'states' );
							log( data.name + ': login' );
						}
						
				} else {
					if( connection == undefined )
						if( data._id != undefined ) {
							connection = { id: data.id, state: 'login', name: data.name, time: now() };
							let message = { type: 'login', name: data.name, room: get_login_connections() };
							db_rewrite( connections_path, connection.id, connection );
							socket_broadcast( connection.id, message );
							socket_send( connection.id, message );
							socket_send_objects( connection.id, 'states' );
							log( data.name + ': relogin' );
						}
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
					let connection = { time: now(), id: socket.id, name: 'anonimous', state: 'logout' };
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
				if( connection != undefined ) {
					//log('vector ' + js(connection));
					if( data.sharing == 'all' ) socket_broadcast( connection.id, data );
				}
				break;
			}

			case 'set': {
				if( connection != undefined ) {
					log( connection.name + ': set ' + data.object.name );
					//db_del_item_by_name( objects_path, data.object.name );
					db_add_item( objects_path, data.object );
				}
				break;
			}

			case 'get': {
				if( connection != undefined ) {
					log( connection.name + ': get ' + data.name );
					socket_send_objects( connection.id, data.name );
				}
				break;
			}

			case 'del': {
				if( connection != undefined ) {
					log( connection.name + ': del ' + data.name );
					db_del_item_by_name( objects_path, data.name );
				}
				break;
			}

			default: break;
		}
		
	});

	socket.on( 'disconnect', function( data ) {
		if( show_conn_log ) log( 'close connection ' + socket.id );// + ': ' + js(data) );
		let connection = db_get_item_by_id( connections_path, socket.id );
		if( connection != undefined ) {
			//log( js(connection), false );
			let message = { type: 'logout', name: connection.name };
			socket_broadcast( socket.id, message );
			db_del_item_by_id( connections_path, socket.id );
		}
	});

});



