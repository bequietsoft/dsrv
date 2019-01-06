class List {

	constructor( _name = undefined, _debug_info = false ) {
		
		this.items = [];
		this.name = _name;
		this.names = [];
		this.checked = [];
		this.current = -1;
		this.debug_info = _debug_info;

		if ( this.debug_info ) this.print();
	}

	add( item, name = undefined, checked = true ) {

		if( Array.isArray(item) )
			item.forEach( element => { this.add( element, checked ) } );
		else {
			this.items.push ( item );
			this.names.push ( name );
			this.checked.push ( checked );
			this.current = this.items.length - 1;
		}

		if( !Array.isArray( item ) && this.debug_info ) this.print();
	}

	del( item ) {
		for( let i = 0; i < this.items.length; i++ )
			if( this.items[i] == item ) {
				this.items.splice( i, 1);
				this.names.splice( i, 1);
				this.checked.splice( i, 1);
				this.current = this.items.length - 1;
			}

		if ( this.debug_info ) this.print();
	}

	print( only_current = false) {
		if( this.name != undefined ) log( this.name + ':' );
		for( let i = 0; i < this.items.length; i++ ) {
			let current_tag = ' ';
			let checked_tag = '[ ]';
			let item_name = '';
			let item_string = this.items[i];
			if( i == this.current ) current_tag = '>';
			if( this.checked[i] == true ) checked_tag = '[X]';
			if( this.names[i] != undefined ) item_name = this.names[i];
			if (!only_current) 
				log( i + ' ' + current_tag + ' ' + checked_tag + ' ' + item_name + '\t' + js(item_string) );
			else
				if( current_tag == '>' ) 
					log( i + ' ' + checked_tag + ' ' + item_name + '\t' + js(item_string) );
		}

		log();
	}

	check( index = undefined ) {
		if( index == undefined ) index = this.current;
		if( index < 0 || index > this.items.length - 1 ) return;
		this.checked[ index ] = !this.checked[ index ];

		if ( this.debug_info ) this.print();
	}

	check_all() {
		for( let i = 0; i < this.checked.length; i++ ) this.checked[i] = true;
		if ( this.debug_info ) this.print();
	}

	uncheck_all() {
		for( let i = 0; i < this.checked.length; i++ ) this.checked[i] = false;
		if ( this.debug_info ) this.print();
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

	get_checked() {
		let items = [];
		let names = [];
		for( let i = 0; i < this.checked.length; i++ ) 
			if( this.checked[i] == true ) {
				items.push( this.items[i] );
				names.push( this.names[i] );
			}

		return { items: items, names: names };
	}

	item( index = this.current ) {
		return this.items[ index ];
	}
	
}