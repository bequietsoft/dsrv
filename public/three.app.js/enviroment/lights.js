class Lights {
	
	constructor() {

		let scene = App.world.scene;
		
		this.light00 = new THREE.AmbientLight( App.ambient_color, 0.75 );
		scene.add( this.light00 );

		this.light01 = new THREE.DirectionalLight( 0xffffff, 0.5 );
		this.light01.position.set( 20, 20, 20 );
		this.light01.castShadow = true;
		this.light01.shadow.mapSize.width = App.shadow_map_size;
		this.light01.shadow.mapSize.height = App.shadow_map_size;
		this.light01.shadow.camera.left = -App.shadow_camera_size / 2;
		this.light01.shadow.camera.bottom = -App.shadow_camera_size / 2;
		this.light01.shadow.camera.right = App.shadow_camera_size / 2;
		this.light01.shadow.camera.top = App.shadow_camera_size / 2;
		this.light01.shadow.camera.near = App.near;    
		this.light01.shadow.camera.far = App.far;   
		scene.add( this.light01 ); 
		
		//this.add_helpers( scene );
	}

	add_helpers( scene ) {
		scene.add( new THREE.CameraHelper( this.light01.shadow.camera ) );
	}
}

{
//	class Lights1 {
	
		// 	constructor() {
		
		// 		let scene = App.world.scene;
		
		// 		this.alight = new THREE.AmbientLight( App.ambient_color, 0.75 );
				
		// 		// //var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;
		// 		var SHADOW_MAP_WIDTH = 1024, SHADOW_MAP_HEIGHT = 1024;
		
		// 		// color : Integer, intensity : Float, distance : Float, angle : Radians, penumbra : Float, decay : Float 
		// 		this.plight00 = new THREE.SpotLight( App.ambient_color, 0.75, 200, Math.PI, 0.10, 1 );
		// 		this.plight00.position.set( 10, 10, 10 );
		// 		//this.plight00.target.position.set( 0, 1, 0 );
		// 		this.plight00.castShadow = true;
		// 		//this.plight00.shadowCameraVisible = true;
				
		// 		// this.plight00.shadow = new THREE.LightShadow( 
		// 		// 	new THREE.PerspectiveCamera( App.fov, window.innerWidth / window.innerHeight, App.near, App.far ) );
		// 		this.plight00.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 10, 1, 1, 100 ) );
		// 		this.plight00.shadow.bias = 0.00001; // affect on recive shadows
		// 		this.plight00.shadow.mapSize.width = SHADOW_MAP_WIDTH;
		// 		this.plight00.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
		
		// 		// this.plight01 = new THREE.SpotLight( App.ambient_color, 0.25, 200, Math.PI / 3, 0.5, 2 );
		// 		// this.plight01.position.set( 10, 1, -10 );
		// 		// this.plight01.target.position.set( 0, 1, 0 );
				
		
		// 		scene.add( this.alight );
		// 		scene.add( this.plight00 ); 
		// 		//scene.add( this.plight01 );
		
		// 		//this.helpers( scene );
		// 	}
		
		// 	helpers( scene ) {
		// 		scene.add( new THREE.SpotLightHelper( this.plight00 ) );
		// 		//scene.add( new THREE.SpotLightHelper( this.plight01 ) );
		// 	}
		// }
	// }
}