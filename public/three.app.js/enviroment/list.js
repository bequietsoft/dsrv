class List {

	constructor( _name = undefined, _debug_info = false ) {
		this.items = [];
		this.name = _name;
		this.current = -1;
		this.debug_info = _debug_info;
		if ( this.debug_info ) this.print();
	}

	add_named_items( items ) {
		for( let i = 0; i < items.length; i++ ) 
			if( items[i].name != undefined ) 
				if( items[i].name.length > 0 ) this.add( items[i] );
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
		let deletions = 0;
		for( let i = 0; i < this.items.length; i++ )
			if( this.items[i] == item ) {
				this.items.splice( i, 1);
				this.current = this.items.length - 1;
				deletions++;
			}
		if ( this.debug_info ) this.print();
		if( deletions > 0 ) return true;
		return false;
	}

	getid( item ) {
		for( let i = 0; i < this.items.length; i++ )
			if( this.items[i] == item ) {
				return i;
			}
		return -1;
	}

	find( name ) {
		for( let i = 0; i < this.items.length; i++ )
			if( this.items[i].name == name ) return this.items[i];
		return undefined;
	}

	print() {
		//console.clear();
		if( this.name != undefined && this.items.length > 0 ) log( this.name + ':', false );
		for( let i = 0; i < this.items.length; i++ ) {
			let current_tag = ' ';
			let item_string = this.items[i];
			if( i == this.current ) current_tag = '>';
			//log( i + ' ' + current_tag + '\t' + js(item_string) );
			log( '\t' + ("00" + i).slice(-3) + '\t' + current_tag + '\t' + this.items[i].name + '\t(' + js(item_string).length + ' bytes)', false );
		}
		if( this.name != undefined && this.items.length == 0 ) 
			log( this.name + ': empty', false );
		else 
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
		if( index == -1 ) return undefined;
		return this.items[ index ];
	}

	get current_item() {
		if( this.current == -1 ) return undefined;
		return this.items[ this.current ];
	}

	get names() {
		let result = [];
		for( let i = 0; i < this.items.length; i++ ) 
			result.push( items[i].name );
		return result;
	}

}