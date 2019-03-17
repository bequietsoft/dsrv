class Hub {
	
	constructor() {
		
		this.socket = io();
		this.state = 'logout';
		this.name = undefined;
		this.debug = false;

		this.socket.io._reconnectionDelay = 5000;
		this.socket.on( 'connect_error', function (data) {
			if( App.hub.debug ) log( 'connection error: ' + js(data) );
		} );
	
		this.socket.on( 'tocli', function ( data ) {
			
			if( App.hub.debug && data.type != 'ping' ) log( 'incoming data: ' + js(data) );

			switch( data.type ) {
				
				case 'message': {
					App.gui_log( data.name + ': ' + data.text );
					break;
				}
				
				case 'id': {

					document.title = 'anonimous';
					App.gui_log( navigator.userAgent, false );
					//App.gui_log( '? or help for command line help', false );

					if( App.id == undefined ) {	
						if( App.hub.debug ) log( 'ID: ' + data.id );
						App.id = data.id;
						App.hub.send( { type: 'id', text: 'new' } );

						// Auto login in debug mode 
						if( App.debug ) {
							App.input( ("00" + ri(0, 999)).slice(-2) );
						}
					}

					if( App.id != undefined ) 
						if( App.id != data.id ) {	
							if( App.hub.debug ) log( 'ID: ' + App.id + ' > ' + data.id );
							let _id = App.id;
							App.id = data.id;
							App.hub.send( { type: 'login', name: App.hub.name, _id: _id } );
						}
					
					if( data.room != undefined ) {
						data.room.forEach( item => {
							if( item.name != App.hub.name ) {
								App.gui_log( item.name + ': in room' );
								App.world.add( new Avatar( item.name ) );
							}
						});
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
					

					if( App.hub.name == data.name ) {
						if( App.hub.state == 'logout' ) {

							App.gui_log( data.name + ': login' );
							App.hub.state = 'login';
							App.avatar = avatar;
							avatar.root.position.x = rf(-5, 5);
							avatar.root.position.z = rf(-5, 5);
							avatar.root.rotation.set( 0, rf(0, wPI), 0 );
							App.avatar.save();

							App.avatar.joints.states.name = 'states';
							App.world.add( App.avatar.joints.states );

							document.title = App.hub.name;

						} else {
							App.gui_log( data.name + ': relogin' );
							document.title = App.hub.name;
						}
					}

					if( App.hub.name != data.name ) {
						if( App.avatar != undefined ) App.avatar.save();
					}

					break;
				}

				case 'logout': {
					
					App.gui_log( data.name + ': logout' );
					App.world.del( data.name );

					if( App.hub.name == data.name ) {
						App.hub.state = 'logout';
						document.title = 'logout';
						App.world.del( data.name );
						App.world.del( 'states' );
						App.avatar = undefined;
						App.hub.name = undefined;
					} 
					break;
				}

				case 'vector': {
					try {
						let vector = App.world.content.find( data.name );
						let path = data.path.split('.');
						for( let i = 0; i < path.length; i++) vector = vector[ path[i] ];
						vector.set( data.vector.x, data.vector.y, data.vector.z );
					} catch( error ) { 
						if( App.hub.debug ) log('hub vector recive error: ' + js(error) ); 
					}
					break;
				}

				case 'object': {
					try {
						let object = App.world.content.find( data.name );
						if( object != undefined ) {
							Object.keys( data.object ).forEach( key => {
								if( object.hasOwnProperty( key ) ) 
									object[ key ] = data.object[ key ];
							} );
						}
					} catch( error ) { 
						if( App.hub.debug ) log('hub object recive error: ' + js(error) ); 
					}
					break;
				}

				default: break;
			}

		});

		this.send = function( data ) {
			if( App.id == undefined ) { log('Send error: app ID is undefined'); return; }
			data.id = App.id;
			if( App.hub.debug && data.type != 'pong' ) log( 'outcoming data: ' + js(data) );
			this.socket.emit( 'fromcli', data );
		};

		this.send_vector = function( name, path, vector, sharing ) {
			let _vector = new THREE.Vector3( vector.x, vector.y, vector.z );
			App.hub.send( { type: 'vector', name: name, path: path, vector: _vector, sharing: sharing } );
		}
		
	}
}