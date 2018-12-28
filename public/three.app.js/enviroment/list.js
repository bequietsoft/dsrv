class List {

	constructor( _debug_info = false ) {
		
		this.items = [];
		this.checked = [];
		this.current = -1;
		this.debug_info = _debug_info;

		if ( this.debug_info ) this.print();
	}

	add( item, checked = true ) {

		this.items.push ( item );
		this.checked.push ( checked );
		this.current = this.items.length - 1;

		if ( this.debug_info ) this.print();
	}

	del( item ) {
		for( let i = 0; i < this.items.length; i++ )
			if( this.items[i] == item ) {
				this.items.splice( i, 1);
				this.checked.splice( i, 1);
				this.current = this.items.length - 1;
			}

		if ( this.debug_info ) this.print();
	}

	print() {
		
		for( let i = 0; i < this.items.length; i++ ) {
			let current_tag = ' ';
			let checked_tag = '[ ]';
			let item_string = this.items[i];
			if( i == this.current ) current_tag = '>';
			if( this.checked[i] == true ) checked_tag = '[X]';
			log( current_tag + ' ' + checked_tag + ' ' + item_string );
		}

		log();
	}

	check( index = undefined ) {
		if( index == undefined ) index = this.current;
		if( index < 0 || index > this.items.length - 1 ) return;
		this.checked[ index ] = !this.checked[ index ];

		if ( this.debug_info ) this.print();
	}

	next() {
		if ( this.current == -1) return;
		this.current++;
		if ( this.current == this.items.length ) this.current = 0;

		if ( this.debug_info ) this.print();
	}

	prev() {
		if ( this.current == -1) return;
		this.current--;
		if ( this.current == -1 ) this.current = this.items.length - 1;

		if ( this.debug_info ) this.print();
	}

	get_checked() {
		let res = [];
		for( let i = 0; i < this.checked.length; i++ ) 
			if( this.checked[i] == true ) res.push( this.items[i] );

		return res;
	}

	item( index = this.current ) {
		return this.items[ index ];
	}
	
}