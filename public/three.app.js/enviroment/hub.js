class Hub {
	
	constructor() {
		
		this.socket = io();
		
		this.socket.on( 'tocli', function ( data ) {
			
			//log( data );

			switch( data.type ) {
				
				case 'accept':
					// TODO 
					App.id = data.id;
					break;

				case 'json':
					log( data );
					log( eval( data.item ) );
					log( jp( data.value ) );
					ovc( jp( data.value ), eval( data.item ) );
					log( eval( data.item ) );
					log( );
					//Renderer.update();
					//App.update();
					break;

				default:
					break;
			}

		});

		this.send = function( data ) {
			data.id = App.id;
			this.socket.emit( 'fromcli', data );
		};

		this.save = function( item ) {
			let value = js( eval( item ) );
			App.hub.send( { 
				item: item, 
				value: value, 
				type: 'json' 
			} ); 
		}
		
	}
}