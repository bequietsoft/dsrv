class Hub {
	
	constructor() {
		
		this.socket = io();
		
		this.socket.on( 'tocli', function ( data ) {
			
			switch( data.type ) {
				
				case 'message':
					App.gui.item(0).add( data.id + ': ' + data.text );
					break;

				case 'accept':
					App.id = data.id;
					log( 'ID ' + App.id );
					break;

				case 'hash':
					if( App.pass != undefined ) {
						App.gui.item(0).add( data.hash + ' ' + App.pass );
						App.pass = undefined;
					}
					break;
				
				case 'json':
					//log( data.item + ' = ' + data.value );
					ev( data.item + ' = ' + data.value );
					break;
				
				case 'function':
					//log( data.item );
						//old	// let context = eval( getcontext( data.item ) );
						//old	// eval( data.item ).bind( context )();
					run( data.item );
					break;

				default:
					break;
			}

		});

		this.crypt = function( data, key ) {
			let _data = data.split('');
			let _res = key.split('');
			for( let i = 0; i < _res.length; i++ ) {
				_res[ _data[i] ]
			}
		}

		this.send = function( data ) {
			data.id = App.id;
			this.socket.emit( 'fromcli', data );
		};

		this.login = function( ) {

		}

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