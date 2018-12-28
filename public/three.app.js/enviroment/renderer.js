class Renderer  {

	static init() {
		
		Renderer.instance = new THREE.WebGLRenderer({ 
			antialias: true,
			depth: App.far,
			autoClear: false,
			shadowMap: { enabled: true, type: THREE.PCFShadowMap },
			shadowCameraNear: 0, //
			shadowCameraFar: 100,//
			shadowCameraFov: 50, //
			shadowMapBias: 0.0039,
			shadowMapDarkness: 0.5,
			shadowMapWidth: 1024,
			shadowMapHeight: 1024,
		});

		Renderer.instance.setClearColor( App.ambient_color, 1 );
		document.body.appendChild( Renderer.instance.domElement );
	}

	static resize() {
		if( Renderer.width != window.innerWidth || Renderer.height != window.innerHeight ) {
			Renderer.width = window.innerWidth;
			Renderer.height = window.innerHeight;
			Renderer.instance.setSize( Renderer.width, Renderer.height );
		}
	}

	static update() {
		Renderer.resize();
		Renderer.instance.clear();
		Renderer.instance.render( App.world.scene, App.camera );
	}
}