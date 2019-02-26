class Renderer  {

	static init() {
		
		Renderer.instance = new THREE.WebGLRenderer( { antialias: true } );
		//Renderer.instance.antialias = true;
		Renderer.instance.depth = App.far;
		Renderer.instance.setClearColor( App.ambient_color, 1 );
		Renderer.instance.autoClear = false;
		Renderer.instance.shadowMap.enabled = true;
		Renderer.instance.shadowMap.type = THREE.PCFShadowMap;
		//Renderer.instance.shadowMap.type = THREE.BasicShadowMap;
		Renderer.instance.shadowMapBias = 0.00001;
		Renderer.instance.shadowMapDarkness = 0.5;
		Renderer.instance.shadowMapWidth = 1024;
		Renderer.instance.shadowMapHeight = 1024;
		Renderer.instance.domElement.id = 'three_canvas';
		//Renderer.instance.setClearColor( App.ambient_color, 1 );
		//Renderer.instance.vr.enabled = true;

		document.body.appendChild( Renderer.instance.domElement );

		//log(Renderer.instance);
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


