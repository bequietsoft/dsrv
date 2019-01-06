class Hub {
	
	constructor() {
		
		this.socket = io();
		
		this.socket.on( 'tocli', function ( data ) {
			
			log( data );

			if( data.type == 'accept' ) {
				if( App.id == undefined ) {
					//log('Client start. Id = ' + data.id);
						//App.gui.add(data.id + ': ' + js(data));
				} else {
					//log('Client update. Id = ' + data.id);
						//App.send('camera\n' + App.camera.rotation);
						//location.reload();
				}  

				App.id = data.id;
			}

		});

		this.send = function( data ) {
			data.id = App.id;
			this.socket.emit( 'fromcli', data );
		};
		
	}
}