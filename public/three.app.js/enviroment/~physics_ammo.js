class PhysicsAmmo {
	
	constructor() {

		this.gravity = -9.8;
		this.margin = 0.05;
		this.rigid_bodies = [];
		//this.hinge;
		
		this.transform_aux1 = new Ammo.btTransform();

		var collision_configuration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
		var dispatcher = new Ammo.btCollisionDispatcher( collision_configuration );
		var broadphase = new Ammo.btDbvtBroadphase();
		var solver = new Ammo.btSequentialImpulseConstraintSolver();
		var soft_body_solver = new Ammo.btDefaultSoftBodySolver();
		
		this.world = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collision_configuration, soft_body_solver );
		this.world.setGravity( new Ammo.btVector3( 0, this.gravity, 0 ) );
		this.world.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, this.gravity, 0 ) );

		this.cloth;
	}

	add_rigid_body( scene, threeObject, physicsShape, mass, pos, quat ) {

		threeObject.position.copy( pos );
		threeObject.quaternion.copy( quat );
		var transform = new Ammo.btTransform();
			transform.setIdentity();
			transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
			transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
		
		var motionState = new Ammo.btDefaultMotionState( transform );
		var localInertia = new Ammo.btVector3( 0, 0, 0 );
		physicsShape.calculateLocalInertia( mass, localInertia );
		var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
		var body = new Ammo.btRigidBody( rbInfo );
		threeObject.userData.physicsBody = body;
		
		scene.add( threeObject );
		
		if ( mass > 0 ) {
			this.rigid_bodies.push( threeObject );
			// Disable deactivation
			body.setActivationState( 4 );
		}

		this.world.addRigidBody( body );
	}

	add_box( scene, sx, sy, sz, mass, pos, quat, material ) {
		
		var threeObject = new THREE.Mesh( new THREE.BoxBufferGeometry( sx, sy, sz, 1, 1, 1 ), material );
		var shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
		
		shape.setMargin( this.margin );
		
		this.add_rigid_body( scene, threeObject, shape, mass, pos, quat );

		return threeObject;
	}

	add_ground( scene ) {
		
		var pos = new THREE.Vector3();
		var quat = new THREE.Quaternion();

		pos.set( 0, -0.1, 0 );
		quat.set( 0, 0, 0, 1 );

		var ground = this.add_box( scene, 10, -0.1, 10, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF, opacity: 0 } ) );
		ground.castShadow = true;
		ground.receiveShadow = true;

		// textureLoader.load( "textures/grid.png", function ( texture ) {
		// 	texture.wrapS = THREE.RepeatWrapping;
		// 	texture.wrapT = THREE.RepeatWrapping;
		// 	texture.repeat.set( 40, 40 );
			// ground.material.map = texture;
			// ground.material.needsUpdate = true;
	}

	add_cloth( scene ) {
		// Cloth graphic object
		var clothWidth = 2;
		var clothHeight = 2;
		var clothNumSegmentsZ = clothWidth * 15;
		var clothNumSegmentsY = clothHeight * 15;
		var clothPos = new THREE.Vector3( 0, 2, 1 );
		//var clothGeometry = new THREE.BufferGeometry();
		var clothGeometry = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
		clothGeometry.rotateX( Math.PI / 4 );
		clothGeometry.rotateY( Math.PI * 0.4 );
		clothGeometry.translate( clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z - clothWidth * 0.5 );
		//var clothMaterial = new THREE.MeshLambertMaterial( { color: 0x0030A0, side: THREE.DoubleSide } );
		var clothMaterial = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, side: THREE.DoubleSide } );
		
		this.cloth = new THREE.Mesh( clothGeometry, clothMaterial );
		this.cloth.castShadow = true;
		this.cloth.receiveShadow = true;
		
		scene.add( this.cloth );

		let cloth_texture = new THREE.TextureLoader().load( "images/stones.jpg" );
		this.cloth.material.map = cloth_texture;
		this.cloth.material.needsUpdate = true;

		// Cloth physic object
		var softBodyHelpers = new Ammo.btSoftBodyHelpers();
		var clothCorner00 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z );
		var clothCorner01 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z - clothWidth );
		var clothCorner10 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z );
		var clothCorner11 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z - clothWidth );
		var clothSoftBody = softBodyHelpers.CreatePatch( this.world.getWorldInfo(), clothCorner00, clothCorner01, clothCorner10, clothCorner11, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true );
		var sbConfig = clothSoftBody.get_m_cfg();
		sbConfig.set_viterations( 10 );
		sbConfig.set_piterations( 10 );
		clothSoftBody.setTotalMass( 0.9, false );
		Ammo.castObject( clothSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( this.margin * 3 );
		this.world.addSoftBody( clothSoftBody, 1, - 1 );
		this.cloth.userData.physicsBody = clothSoftBody;
		// Disable deactivation
		clothSoftBody.setActivationState( 4 );

		// // Glue the cloth to the arm
		// var influence = 0.5;
		// clothSoftBody.appendAnchor( 0, arm.userData.physicsBody, false, influence );
		// clothSoftBody.appendAnchor( clothNumSegmentsZ, arm.userData.physicsBody, false, influence );

	}

	update( delta_time ) {
		
		// // Hinge control
		// this.hinge.enableAngularMotor( true, 0.8 * armMovement, 50 );

		// Step world
		this.world.stepSimulation( delta_time, 10 );
		
		// Update cloth
		var softBody = this.cloth.userData.physicsBody;
		var clothPositions = this.cloth.geometry.attributes.position.array;
		var numVerts = clothPositions.length / 3;
		var nodes = softBody.get_m_nodes();
		var indexFloat = 0;
		for ( var i = 0; i < numVerts; i ++ ) {
			var node = nodes.at( i );
			var nodePos = node.get_m_x();
			clothPositions[ indexFloat ++ ] = nodePos.x();
			clothPositions[ indexFloat ++ ] = nodePos.y();
			clothPositions[ indexFloat ++ ] = nodePos.z();
		}
		this.cloth.geometry.computeVertexNormals();
		this.cloth.geometry.attributes.position.needsUpdate = true;
		this.cloth.geometry.attributes.normal.needsUpdate = true;

		// Update rigid bodies
		for ( var i = 0, il = this.rigid_bodies.length; i < il; i ++ ) {
			var objThree = this.rigid_bodies[ i ];
			var objPhys = objThree.userData.physicsBody;
			var ms = objPhys.getMotionState();
			if ( ms ) {
				ms.getWorldTransform( this.transform_aux1 );
				var p = this.transform_aux1.getOrigin();
				var q = this.transform_aux1.getRotation();
				objThree.position.set( p.x(), p.y(), p.z() );
				objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
			}
		}
	}

}