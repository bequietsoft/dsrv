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
		if( state == undefined ) return;
		this.states.add( { name: name, data: state } );
	}

	setcurstate( name ) {
		let state = this.states.find( name );
		if( state == undefined ) return;
		this.states.getid( state );
	}

	runstate( name, k = 1, rotation = true, position = false ) {
		let state = this.states.find( name );
		if( state == undefined ) return; 
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