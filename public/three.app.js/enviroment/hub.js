class Hub {
	
	constructor() {
		
		this.socket = io();
		
		this.socket.on( 'tocli', function ( data ) {
			
			switch( data.type ) {
				
				case 'text':
					App.gui.item(0).add( data.id + ': ' + data.text );
					break;

				case 'accept':
					App.id = data.id;
					break;

				case 'json':
					//log( data.item + ' = ' + data.value );
					ev( data.item + ' = ' + data.value );
					break;
				
				case 'function':
					//log( data.item );
					let context = eval( getcontext( data.item ) );
					eval( data.item ).bind( context )();
					break;

				default:
					break;
			}

		});

		this.send = function( data ) {
			data.id = App.id;
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
			if( typeof obj != "function") return;
			App.hub.send( { item: item, type: 'function' } ); 
		}
		
	}
}