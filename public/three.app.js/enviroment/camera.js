class Camera extends THREE.PerspectiveCamera {

	constructor( distance = 5 ) {
		
		//log( 'Create camera' );

		super( App.fov, window.innerWidth / window.innerHeight, App.near, App.far );
		
		//this.translateX( -distance );
		
		this.tank = new THREE.Object3D();
		this.target = new THREE.Object3D();
		
		this.tank.add( this.target );
		this.target.add( this );
		
		// this.tank.add( helper( 0.5, 0.5, 0.5, 'red') );
		// this.target.add( helper( 0.51, 0.51, 0.51, 'green') );

		this.position.x = -distance;

		App.world.scene.add( this.tank );
	}

	update( object ) {
		
		if( object == undefined ) return;

		// App.camera.tank.position.x = object.position.x;
		// App.camera.tank.position.y = object.position.y;
		// App.camera.tank.position.z = object.position.z;
		App.camera.tank.position.set( object.position.x, object.position.y, object.position.z );
		App.camera.tank.rotation.set( object.rotation.x, object.rotation.y, object.rotation.z );

		let tp = AV( object.position, App.camera.target.position );
		App.camera.lookAt( tp.x, tp.y, tp.z );
	}
}