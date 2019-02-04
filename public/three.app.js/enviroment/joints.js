class Joints {
	
	constructor( name ) {
		this.name = name;
		this.nodes = new List();
		this.markers = new List();
		this.states = new List();
		this.edit = false;
	}

	add( root, names, color, size ) {

		for( let i = 0; i < names.length; i++ )	root.data.bones[i].name = names[i];
		List.add_named_items( root.data.bones, this.nodes );

		if( this.cursor == undefined ) {
			let material = mat( 'basic', black );
			let marker = sphere( size * 2, V0, V0, material, false, 8 );
				marker.renderOrder = 999;
				marker.visible = false;
				marker.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
			this.cursor = marker;
		}

		let material = mat( 'basic', color );
		for( let i = 0; i < names.length; i++ )	{
			let _size = size;
			let _div = 8;
			if( names[i] == undefined ) { _size = size / 4; _div = 2; }
			let marker = sphere( _size, V0, V0, material, false, _div );
				marker.renderOrder = 999;
				marker.visible = false;
				marker.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
			root.data.bones[i].add( marker );
			marker.add( this.cursor );
			
			this.markers.add( marker );
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

		return statedata;
	}

	setstatedata( data, rotation, position ) {
		
		if( data.length == 0 ) return;
		if( this.nodes.items.length == 0 ) return;
		
		data.forEach( item => {
			let node = this.nodes.find( item.name );
			if( node != undefined ) {
				if( rotation ) node.rotation.set( item.rotation.x, item.rotation.y, item.rotation.z );
				if( position ) node.position.set( item.position.x, item.position.y, item.position.z );
			}
		} );
	}

	savestate( name ) {
		let state = this.states.find( name );
		if( state != undefined ) this.states.del( state );
		this.states.print();
		this.states.add( { name: name, data: this.getstatedata() } );
		this.states.print();
	}

	loadstate( name, rotation, position ) {
		let state = this.states.find( name );
		if( state != undefined ) 
			this.setstatedata( state.data, rotation, position );
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