class Hub {
	
	constructor() {
		
		this.socket = io();
		
		//this.socket.io._reconnection = false;
		this.socket.io._reconnectionDelay = 5000;
		log( this.socket );

		this.socket.on( 'connect_error', function (data) {
			log( 'connection error ' + js(data) );// + ' delay = ' + 
			//App.hub.socket.io._reconnectionDelay );
		});
	
		this.socket.on( 'tocli', function ( data ) {
			//log( data );
			switch( data.type ) {
				
				case 'message':
					App.gui.item(0).add( data.name + ': ' + data.text );
					break;

				case 'id':	
					if( App.id == undefined ) {
						App.id = data.id;
						App.hub.send( { type: 'id', text: 'new' } );
					} else {
						let _id = App.id;
						App.id = data.id;
						App.hub.send( { type: 'id', text: 'update', _id: _id } );
					}
					log( 'ID ' + App.id );
					break;
				
				case 'ping':
					App.hub.send( { type: 'pong' } );
					break;

				case 'hash':
					App.hash = data.hash;
					App.state = 'login';
					break;
				
				case 'auth':
					App.hash = undefined;
					App.state = 'auth';
					App.add_avatars();
					break;

				// case 'json':
				// 	//log( data.item + ' = ' + data.value );
				// 	ev( data.item + ' = ' + data.value );
				// 	break;
				
				// case 'function':
				// 	//log( data.item );
				// 		//old	// let context = eval( getcontext( data.item ) );
				// 		//old	// eval( data.item ).bind( context )();
				// 	run( data.item );
				// 	break;

				default:
					break;
			}

		});

		this.send = function( data ) {
			if( App.id == undefined ) { log('Send error: app ID is undefined'); return; }
			data.id = App.id;
			//log( data );
			this.socket.emit( 'fromcli', data );
		};

		this.save_item = function( item ) {

			//log( item ) 
			let obj = eval( item );
			let keys = Object.keys( obj );
			
			if( keys.length == 0 ) {
				if(js( obj )) 
					App.hub.send( { item: item, value: js( obj ), type: 'json' } ); 
				return;
			}

			keys.forEach( k => { 
				if( k.startsWith('_') ) k = k.substr(1);
				try { 
					this.save_item( item + '.' + k ); 
				} catch( e ) {}
			});
				
		}

		this.save_func = function( item ) {
			let obj = eval( item );
			if( typeof obj != "function" ) return;
			App.hub.send( { item: item, type: 'function' } ); 
		}
		
	}
}