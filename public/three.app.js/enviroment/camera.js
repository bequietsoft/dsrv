class Camera extends THREE.PerspectiveCamera {

	constructor( distance = 5 ) {
		
		//log( 'Create camera' );

		super( App.fov, window.innerWidth / window.innerHeight, App.near, App.far );
		this.position.x = -distance;
		//this.translateX( -distance );
		
		this.tank = new THREE.Object3D();
		this.target = new THREE.Object3D();
		
		this.tank.add( this.target );
		this.target.add( this );
		
		this.tank.add( helper( 1.1, 1.1, 1.1, 'red') );
		this.target.add( helper( 1.11, 1.11, 1.11, 'green') );

		this.control_position = true;
		// this.control_horizontal_rotation = true;
		// this.control_vertical_rotation = false;
		this.control_view = true;

		//App.world.scene.add( this.target );
		App.world.scene.add( this.tank );
	}

	update( object ) {
		
		if( this.control_position ) 
			//App.camera.target.position.set( object.position.x, object.position.y, object.position.z );
			App.camera.tank.position.set( object.position.x, object.position.y, object.position.z );

		// if( this.control_rotation && this._object_rotation != undefined ) {
		// 	App.camera.tank.rotateX( object.rotation.x - this._object_rotation.x );
		// 	App.camera.target.rotateY( object.rotation.y - this._object_rotation.y );
		// 	App.camera.target.rotateZ( object.rotation.z - this._object_rotation.z );
		// }
	

		if( this.control_horizontal_rotation ) {
			//log(App.camera.tank.rotation.y + ' ?? ' +  object.rotation.y);
			//App.camera.tank.rotation.y = object.rotation.y;
		}

		if( this.control_view ) 
			App.camera.lookAt( object.position.x, object.position.y, object.position.z );

		
		// //
		// //if( this._object_position == undefined ) this._object_position = V0;
		// if( this._object_rotation == undefined ) this._object_rotation = V0;
		// //this._object_position.set( object.position.x, object.position.y,  object.position.z );
		// this._object_rotation.set( object.rotation.x, object.rotation.y,  object.rotation.z );
	}
}