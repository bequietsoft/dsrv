class Camera extends THREE.PerspectiveCamera {

	constructor( scene, distance, rotation, helpers ) {
		
		super( App.fov, window.innerWidth / window.innerHeight, App.near, App.far );
		
		this.tank = new THREE.Object3D();
		this.target = new THREE.Object3D();
		
		this.tank.add( this.target );
		this.target.add( this );
		
		this.position.x = -distance;
		this.target.rotateZ( rotation.z ); 

		scene.add( this.tank );
		
		if( helpers ) {
			this.tank.add( helper( 0.25, 0.25, 0.25, 'red') );
			this.target.add( helper( 0.251, 0.251, 0.251, 'green') );
		}
	}

	update( object ) {
		
		if( object == undefined ) return;

		App.camera.tank.position.set( object.position.x, object.position.y, object.position.z );
		App.camera.tank.rotation.set( object.rotation.x, object.rotation.y, object.rotation.z );

		let tp = AV( object.position, App.camera.target.position );
		App.camera.lookAt( tp.x, tp.y, tp.z );
	}
}