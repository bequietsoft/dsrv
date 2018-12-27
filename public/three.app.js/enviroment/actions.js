class Actions {
	
	static init() {
		Actions.items = [];
		Actions.debug_info = false;
	}

	static update() {
		if( Actions.items.length == 0 ) return;
		for( let i = 0; i < Actions.items.length; i++ ) 
			if( Actions.items[i].data != undefined )
				if( Actions.items[i].data.update != undefined ) { 
					if( this.debug_info ) log( 'do action ' + this.items[i].data.id );
					this.items[i].data.update( this.items[i].data );
				}
	}

	static add( data = { id: undefined } ) {
		
		let exist = false;
		if( data.id != undefined ) 
			for( let i = 0; i < Actions.items.length; i++ ) {
				if( Actions.items[i].id == data.id ) {
					if ( Actions.debug_info ) log( 'rewrite action ' + data.id );
					Actions.items.data = data;
					exist = true;
					break;
				}
			}

		if( data.id == undefined || exist == false ) {
			if ( Actions.debug_info ) log( 'add action ' + data.id );
			Actions.items.push( { data: data } );
		}
	}

	static del( id = undefined ) {
		if( id == undefined ) return;
		for( let i = 0; i < Actions.items.length; i++ ) 
		{
			if( Actions.items[i].data.id == id ) {
				if ( Actions.debug_info ) log( 'delete action ' + id );
				Actions.items.splice( i, 1 );
			}
		}
	}

	static index( id ) {
		for( let i = 0; i < Actions.items.length; i++ ) 
			if( Actions.items[i].id == id ) return i;
		return -1;
	}

	static clear() {
		if ( Actions.debug_info ) log( 'clear all actions' );
		Actions.items = [];
	}
}
