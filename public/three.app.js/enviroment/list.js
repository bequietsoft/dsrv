class List {

	constructor( _name = undefined, _debug_info = false ) {
		this.items = [];
		this.name = _name;
		this.current = -1;
		this.debug_info = _debug_info;
		if ( this.debug_info ) this.print();
	}

	clear() {
		this.items = [];
		this.names = [];
		this.checked = [];
		this.current = -1;
	}

	add( item ) {
		this.items.push ( item );
		this.current = this.items.length - 1;
		if( !Array.isArray( item ) && this.debug_info ) this.print();
	}

	del( item ) {
		for( let i = 0; i < this.items.length; i++ )
			if( this.items[i] == item ) {
				this.items.splice( i, 1);
				this.current = this.items.length - 1;
			}
		if ( this.debug_info ) this.print();
	}

	find( name ) {
		for( let i = 0; i < this.items.length; i++ )
			if( this.items[i].name == name ) return this.items[i];
		return undefined;
	}

	print() {
		if( this.name != undefined ) log( this.name + ':' );
		for( let i = 0; i < this.items.length; i++ ) {
			let current_tag = ' ';
			let item_string = this.items[i];
			if( i == this.current ) current_tag = '>';
			log( i + ' ' + current_tag + '\t' + js(item_string) );
		}
		log();
	}

	next() {
		if ( this.current == -1) return;
		this.current++;
		if ( this.current == this.items.length ) this.current = 0;
		if ( this.debug_info ) this.print( true );
	}

	prev() {
		if ( this.current == -1) return;
		this.current--;
		if ( this.current == -1 ) this.current = this.items.length - 1;
		if ( this.debug_info ) this.print( true );
	}

	item( index = this.current ) {
		return this.items[ index ];
	}
	
}