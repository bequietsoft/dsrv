class Camera extends THREE.PerspectiveCamera {

	constructor( distance, pos, fov, aspect, near, far  ) {
		
		super( fov, aspect, near, far );

		this.position.set( pos.x, pos.y, pos.z );
		this.translateX( -distance );
		this.lookAt( pos.x, pos.y, pos.z );
		
		this.target = new THREE.Object3D();
		this.target.position.set( pos.x, pos.y, pos.z );
		this.target.add( this );
	}
}