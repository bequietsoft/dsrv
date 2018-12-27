class Events {

	static init () {
		Events.items = [];
		Events.debug_info = false;
	}

	static bind( type, action, key = undefined, object = undefined ) {
		
		let event = {
			type: type,
			key: key,
			action: action,
			object: object
		};
		Events.items.push ( event );
	}

	static run( event ) {
		for( let i = 0; i < Events.items.length; i++ ) 
			if( Events.items[i].type == event.type )
				if ( Events.items[i].key == event.key || Events.items[i].key == undefined ) {
					if( Events.debug_info ) log( 'run event ' + js(event) );
					Events.items[i].action( Events.items[i].object );
				}
	}
}
