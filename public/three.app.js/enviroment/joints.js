class Joints {
	
	constructor( name ) {
		this.name = name;
		this.nodes = new List();
		this.markers = new List();
		this.vmarkers = new List();
		this.states = new List();
		this.edit = false;
	}

	add( root, names, color, size ) {

		for( let i = 0; i < names.length; i++ )	root.data.bones[i].name = names[i];
		List.add_named_items( root.data.bones, this.nodes );

		if( this.cursor == undefined )
			this.cursor = marker( V0, rgb(0, 0, 0), size * 2, 8, false );;

		for( let i = 0; i < names.length; i++ )	{
			let m = marker( V0, color, size, 8, false );
			if( names[i] == undefined ) m = marker( V0, color, size / 2, 2, false ); 
			root.data.bones[i].add( m );
			m.add( this.cursor );
			this.markers.add( m );
		}
	}

	getstatedata() {
		
		if( this.nodes.items.length == 0 ) return;
		
		let statedata = [];
		this.nodes.items.forEach( node => {
			statedata.push( {	
				name: node.name, 
				rotation: new THREE.Vector3( node.rotation.x, node.rotation.y, node.rotation.z ),
				position: new THREE.Vector3( node.position.x, node.position.y, node.position.z )
			} );
		} );

		if( statedata.length == 0 ) return undefined;
		return statedata;
	}

	setstatedata( data, k, rotation, position ) {
		
		if( data.length == 0 ) return;
		if( this.nodes.items.length == 0 ) return;
		
		data.forEach( item => {
			let node = this.nodes.find( item.name );
			if( node != undefined ) {
				
				if( rotation ) {
					let r = SV( node.rotation, item.rotation, k );
					node.rotation.set( r.x, r.y, r.z );
				}
				
				if( position ) {
					let p = SV( node.position, item.position, k );
					node.position.set( p.x, p.y, p.z );
				}
			}
		} );
	}

	delstate( name ) {
		let state = this.states.find( name );
		if( state == undefined ) return;
		this.states.del( state );
	}

	addstate( name ) {
		this.delstate( name );
		let state = this.getstatedata();
		if( state == undefined ) { log('no active nodes?'); return; }
		this.states.add( { name: name, data: state } );
	}

	setcurstate( name ) {
		let state = this.states.find( name );
		if( state == undefined ) { log('state ' + name + ' not found'); return; }
		this.states.getid( state );
	}

	runstate( name, k = 1, rotation = true, position = false ) {
		let state = this.states.find( name );
		if( state == undefined ) { log('state ' + name + ' not found'); return; }
		this.setstatedata( state.data, k, rotation, position );
	}

	prev() {
		if( !this.edit ) return;
		this.nodes.prev();
		this.nodes.current_item.add( this.cursor );
		log( this.nodes.current_item.name );
	}

	next() {
		if( !this.edit ) return;
		this.nodes.next();
		this.nodes.current_item.add( this.cursor );
		log( this.nodes.current_item.name );
	}

	print() {
		this.nodes.print();
	}
}