class Hub {
	
	constructor() {
		
		this.socket = io();
		this.state = 'logout';
		this.name = undefined;

		//this.socket.io._reconnection = false;
		this.socket.io._reconnectionDelay = 5000;
		// log( this.socket );

		// this.socket.on( 'connect_error', function (data) {
		// 	log( 'connection error ' + js(data) );// + ' delay = ' + 
		// 	//App.hub.socket.io._reconnectionDelay );
		// });
	
		this.socket.on( 'tocli', function ( data ) {
			
			//log( data );
			switch( data.type ) {
				
				case 'message':
					App.gui.item(0).add( data.name + ': ' + data.text );
					break;
				
				case 'id':	
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
						if( App.hub.state == 'login' ) {
							App.world.scene.remove( App.avatar.root );
							App.avatar = undefined;
							App.hub.send( { type: 'login', name: App.hub.name } );
						}
					}
					
					document.title = 'logout';
					log( 'ID = ' + App.id );
					
					//App.avatars.clear();
					
					// if( data.room != undefined ) {
					// 	//log(data.room, false);
					// 	App.avatars.clear();
					// 	data.room.forEach( member => {
					// 		let avatar = new Avatar( member.name )
					// 		App.avatars.add( avatar );
					// 		App.world.scene.add( avatar.root );
					// 		App.gui.item(0).add( member.name + ': already in room' );
					// 	});
					// }

					break;
				
				case 'ping': {
					App.hub.send( { type: 'pong' } );
					break;
				}
				
				case 'login': {
					//log( 'debug login: ' + App.hub.name + ' ??? ' + data.name);
					if( App.hub.name == data.name ) {
						App.hub.state = 'login';
						document.title = App.hub.name;
						App.avatar = new Avatar( App.hub.name );
						App.avatar.root.position.set( rf(-5, 5), 0.8, rf(-5, 5) );
						//App.avatar.root.rotation.set( 0, rf(0, wPI), 0 );
						App.world.scene.add( App.avatar.root );
						App.avatar.save( 'all' );
					}
					else {
						App.gui.item(0).add( data.name + ': login' );
						let avatar = new Avatar( data.name )
						App.avatars.add( avatar );
						App.world.scene.add( avatar.root );

						log( data.name + ' login avatars =' +  App.avatars.items.length );
					}
					break;
				}

				case 'logout': {
					//log( 'debug logout: ' + App.hub.name + ' ??? ' + data.name);
					if( App.hub.name == data.name ) {
						App.hub.state = 'logout';
						App.world.scene.remove( App.avatar.root );
						App.avatar = undefined;
						document.title = 'logout';
						App.hub.name = undefined;
					} 
					else {
						App.gui.item(0).add( data.name + ': logout' );
						let avatar = App.avatars.find( data.name );
						if( avatar ) {
							App.world.scene.remove( avatar );
							App.avatars.del( avatar );
						}

						log( data.name + ' logout avatars =' +  App.avatars.items.length );
					}
					break;
				}

				case 'json': {
					
					// log( data, false );

					if( data.name == App.hub.name ) {
						//log( 'Resore?: ' + js(data) );
					}
					else {

						data.item = data.item.replace( 
							'App.avatar', 
							'App.avatars.find("' + data.name + '")' );
						ev( data.item + ' = ' + data.value );
						// if ( ev( data.item + ' = ' + data.value ) )
						// 	log( data.name + ' moving' );
					}
					//log( data.id + ': ' + data.item + ' = ' + data.value );
					//ev( data.item + ' = ' + data.value );
					break;
				}

				default:
					break;
			}

		});

		this.send = function( data ) {
			if( App.id == undefined ) 
			{ log('Send error: app ID is undefined'); return; }
			data.id = App.id;
			//if( data.broadcast != undefined ) log('btoadcast send: ' + js(data) );
			this.socket.emit( 'fromcli', data );
		};

		this.send_item = function( item, broadcast ) {
			
			if( App.hub.name == undefined ) 
			{ log('Send item error: cant send item in logout mode '); return; }
			let obj = eval( item );
			let keys = Object.keys( obj );

			if( keys.length == 0 ) {
				if( js( obj ) ) 
					App.hub.send( { type: 'json', name: App.hub.name, broadcast: broadcast, item: item, value: js( obj ) } ); 
				return;
			}

			keys.forEach( k => { 
				if( k.startsWith('_') ) k = k.substr(1);
				try { 
					this.send_item( item + '.' + k, broadcast ); 
				} catch( e ) {}
			});
		}
		
	}
}