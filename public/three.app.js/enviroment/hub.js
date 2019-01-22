class Hub {
	
	constructor() {
		
		this.socket = io();
		this.state = 'logout';
		this.name = undefined;
		this.debug = true;

		this.socket.io._reconnectionDelay = 5000;
		this.socket.on( 'connect_error', function (data) {
			log( 'connection error ' + js(data) );
		} );
	
		this.socket.on( 'tocli', function ( data ) {
			
			if( this.debug && data.type != 'ping' ) log( 'data: ' + js(data) );

			switch( data.type ) {
				
				case 'message': {
					App.gui.item(0).add( data.name + ': ' + data.text );
					break;
				}
				
				case 'id': {

					if( App.id == undefined ) {	
						App.id = data.id;
						document.title = App.id;
						App.hub.send( { type: 'id', text: 'new' } );

						// Auto login in debug mode 
						if( App.debug ) App.input( ("00" + ri(0, 999)).slice(-2) );

					} else {
						let _id = App.id;
						App.id = data.id;
						App.hub.send( { type: 'id', text: 'update', _id: _id } );
					}
					
					document.title = 'anonimous';
					log( 'ID = ' + App.id );
					
					if( data.room != undefined ) 
						if( data.room.length > 0 ) {
							log( 'id: room = ' + js(data.room) );
							log( 'id: content = ' + js(App.world.content.names) );
						}

					break;
				}
				
				case 'ping': {
					App.hub.send( { type: 'pong' } );
					break;
				}
				
				case 'login': {
					
					let avatar = new Avatar( data.name );
					App.world.add( avatar );
					log( data.name + ': login' );
					avatar.root.position.set( rf(-5, 5), 0, rf(-5, 5) );

					if( data.room != undefined ) {
						//log( data.room, false );
						data.room.forEach( item => {
							log( item.name + ': present' );
							App.world.add( new Avatar( item.name ) );
						});
					}

					if( App.hub.name == data.name ) {
						App.hub.state = 'login';
						App.avatar = avatar;
						document.title = App.hub.name;
					}
					break;
				}

				case 'logout': {
					
					log( data.name + ': logout' );

					if( App.world.del( data.name ) ) log( data.name + ': logout' );

					if( App.hub.name == data.name ) {
						App.hub.state = 'logout';
						document.title = 'logout';
						App.world.del( data.name );
						App.avatar = undefined;
						App.hub.name = undefined;
					} 
					break;
				}

				case 'vector': {
					log( data.name + ': ' + data.path + ' = ' + js(data.vector) );
					try {
						let item = App.world.content.find( data.name );
						//log( js(item) + '.' + data.path, false );
						let item_vector = eval( item[ data.path ] );
						log( item[ data.path ], false );
						log( item_vector, false );
						//log( v, false ); 
						//log();
					} catch( error ) { log( error ); }
					break;
				}

				{
				// case 'json': {
					
				// 	if( data.name == App.hub.name ) {
				// 		// restore data 
				// 	}
				// 	else {

				// 		data.item = data.item.replace( 
				// 			'App.avatar', 
				// 			'App.avatars.find("' + data.name + '")' );
						
						

				// 		//ev( data.item + ' = ' + data.value );
						
				// 		if( data.item.includes('rotation.y') ) {
				// 			log( 'recive1: ' + data.value + ' --- ' + target.rotation.y );
				// 			let target = App.avatars.find(data.name).root;
				// 			target.rotation.set( 0, eval(data.value), 0 );
				// 			log( 'recive2: ' + data.value + ' --- ' + target.rotation.y );
				// 		} 
				// 		else ev( data.item + ' = ' + data.value );
				// 	}
				
				// 	break;
				// }
				}

				default: break;
			}

		});

		this.send = function( data ) {
			if( App.id == undefined ) { log('Send error: app ID is undefined'); return; }
			data.id = App.id;
			this.socket.emit( 'fromcli', data );
		};

		this.send_vector = function( name, path, vector, sharing ) {
			App.hub.send( { type: 'vector', name: name, path: path, vector: vector, sharing: sharing } );
		}

		{
		// this.send_item = function( item, broadcast ) {
			
		// 	if( App.hub.name == undefined ) 
		// 	{ log('Send item error: cant send item in logout mode '); return; }
		// 	let obj = eval( item );
		// 	let keys = Object.keys( obj );

		// 	if( keys.length == 0 ) {
		// 		if( js( obj ) ) 
		// 			App.hub.send( { type: 'json', name: App.hub.name, broadcast: broadcast, item: item, value: js( obj ) } ); 
		// 		return;
		// 	}

		// 	keys.forEach( k => { 
		// 		if( k.startsWith('_') ) k = k.substr(1);
		// 		try { 
		// 			this.send_item( item + '.' + k, broadcast ); 
		// 		} catch( e ) {}
		// 	});
		// }
		}
		
	}
}