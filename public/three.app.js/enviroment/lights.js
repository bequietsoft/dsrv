class Lights {
	
	constructor() {

		let scene = App.world.scene;

		this.alight = new THREE.AmbientLight( App.ambient_color, 0.75 );
		
		// //var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;
		var SHADOW_MAP_WIDTH = 512, SHADOW_MAP_HEIGHT = 512;

		this.plight00 = new THREE.SpotLight( App.ambient_color, 0.75, 200, Math.PI / 2, 0.5, 1 );
		this.plight00.position.set( 10, 10, 10 );
		this.plight00.target.position.set( 0, 1, 0 );
		this.plight00.castShadow = true;
		this.plight00.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 10, 1, 1, 100 ) );
		this.plight00.shadow.bias = 0.001;
		this.plight00.shadow.mapSize.width = SHADOW_MAP_WIDTH;
		this.plight00.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

		this.plight01 = new THREE.SpotLight( App.ambient_color, 0.25, 200, Math.PI / 3, 0.5, 2 );
		this.plight01.position.set( 10, 1, -10 );
		this.plight01.target.position.set( 0, 1, 0 );
		

		scene.add( this.alight );
		scene.add( this.plight00 ); 
		//scene.add( this.plight01 );

		//this.helpers( scene );
	}

	helpers( scene ) {
		scene.add( new THREE.SpotLightHelper( this.plight00 ) );
		//scene.add( new THREE.SpotLightHelper( this.plight01 ) );
	}
}

