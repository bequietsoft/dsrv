var http = require( 'http' );
var io = require( 'socket.io' );

var path = require( 'path' ); 
var fs = require( 'fs' );

var jsondb = require( 'node-json-db' );
var db = new jsondb( "db", true, true );

var debug = true;

var port = 3000;
var root = __dirname;
var public_dir = 'public';
var index = 'index.html';
var connections_path = '/connections';

var sockets = [];

// #region send

function sendFile( file ) {
	//var stat = fs.statSync( file );
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

function log( message = undefined, timestamp = true ) {
	if( message == undefined ) message = '';
	if( timestamp ) 
		console.log( ts() + '  ' + message );
	else
		console.log( message );
}

function now() {
	let now = Date(Date.now());
	return now;//now.Hours + ':' + now.Minutes + ':' + now.Seconds;
}

function ts() {
	var d = new Date();
	var h = ("0" + d.getHours()).slice(-2);
	var m = ("0" + d.getMinutes()).slice(-2);
	var s = ("0" + d.getSeconds()).slice(-2);
	var ms = ("000" + d.getMilliseconds()).slice(-3);
	return h + ':' + m + ':' + s + '.' + ms;
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

function socket_send( id, event, data ) {
	let index = get_socket_index_by_id( id );
	if( index == -1 ) return;
	sockets[ index ].emit( event, data );
}

function socket_broadcast( id, event, data ) {
	let index = get_socket_index_by_id( id );
	if( index == -1 ) return;
	sockets[ index ].broadcast.emit( event, data );
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

function db_rewrite( path, id, data ) {
	db_del_item_by_id( path, id );
	db_add_item( path, data );
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
	setInterval( update_connections, 5000 );
});

function update_connections() {
	
	//log( 'update ' + now() );
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
					db.delete( connections_path + '[' + i + ']' );
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
		//if( connection == undefined ) return;
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
							socket_broadcast( connection.id, 'tocli', message );
							socket_send( connection.id, 'tocli', message );
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
							connection.storage = [];
							connection.time = now();
							db_rewrite( connections_path, connection.id, connection );
							socket_broadcast( connection.id, 'tocli', message );
							socket_send( connection.id, 'tocli', message );
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
						storage: [] 
					};
					db_add_item( connections_path, connection );
				} 

				if( data.text == 'update' ) 
					db_del_item_by_id( connections_path, data._id );

				break;
			}

			case 'pong': {
				//let connection = db_get_item_by_id( connections_path, data.id );
				connection.time = now();
				db_rewrite( connections_path, data.id, connection );
				break;
			}

			case 'message': {
				if( connection != undefined ) {
					log( connection.name + ': ' + data.text );
					let message = { type: 'message', name: connection.name, text: data.text };
					socket_broadcast( connection.id, 'tocli', message );
					socket_send( connection.id, 'tocli', message );
				}
				break; 
			}

			case 'json': {
				
				if( connection != undefined ) {
					let update = false;
					connection.storage.forEach( element => {
						if( element.item == data.item ) {
							element.value = data.value;
							//log( connection.name + ': ' + data.item + ' update');
							update = true;
						} 
					});
					if( !update ) {
						connection.storage.push( { item: data.item, value: data.value } ); 
						//log( connection.name + ': ' + data.item + ' create');
					}
					db_rewrite( connections_path, data.id, connection );

					if( data.broadcast == 'all' ) {
						//log( js(data) );
						socket_broadcast( connection.id, 'tocli', data );
					}
				}
			}

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



