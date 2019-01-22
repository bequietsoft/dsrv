class World {
	
	constructor() {
		
		this.scene = new THREE.Scene();
		this.content = new List( 'content' );

		this.root = new THREE.Object3D();
		//this.root.pickable = false;
		this.root.name = 'world';

		this.scene.background = new THREE.Color( App.ambient_color );
		this.scene.fog = new THREE.Fog( App.fog_color, App.far * App.fog, App.far );

		var geometry = new THREE.PlaneBufferGeometry( 1, 1 );
		var planeMaterial = new THREE.MeshPhongMaterial( { color: rgb( 140, 140, 140 ) } );
		var ground = new THREE.Mesh( geometry, planeMaterial );
			ground.name = 'ground';
			ground.position.set( 0, 0, 0 );
			ground.rotation.x = - Math.PI / 2;
			ground.scale.set( App.far /2, App.far /2, 1 );
			ground.castShadow = false;
			ground.receiveShadow = true;

			this.root.add( ground );
		
		//this.content.push( this.root );
		this.scene.add( this.root );

		this.helpers();
	}

	helpers() {
		var grid = new THREE.GridHelper( 10, 10, rgb(220), rgb(200) );
			grid.name = 'grid';
			grid.position.y = 0.001;
			this.root.add( grid );
	}

	add( item ) {
		let _item = this.content.find( item.name );
		if( _item != undefined ) return false;
		this.content.add( item );
		if( item.root != undefined ) this.scene.add( item.root );
		return true;
	}

	del( name ) {
		let item = this.content.find( name );
		if( item == undefined ) return false;
		this.content.del( item );
		if( item.root != undefined ) this.scene.remove( item.root );
		return true;
	}
}


