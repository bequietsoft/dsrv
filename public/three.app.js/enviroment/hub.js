class Hub {
	
	constructor() {
		
		this.socket = io();
		
		this.socket.on('tocli', function (msg) {
			
			if (msg.data == 'accept') {
				if(App.id == undefined) {
					//log('Client start. Id = ' + msg.id);
						
						//App.gui.add(msg.id + ': ' + msg.data);
				} else {
					//log('Client update. Id = ' + msg.id);

						//App.send('camera\n' + App.camera.rotation);
						//location.reload();
				}  

				App.id = msg.id;
			}

		});

		this.send = function(data) {
			this.socket.emit( 'fromcli', { 
				id: App.id, 
				data: data 
			} );
		};
		
	}
}