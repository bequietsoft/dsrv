function renderer(antialias = true) {
	
	//#region old code
	// var r = new THREE.WebGLRenderer();
	
	// r.depth = 2000;
	// r.antialias = true;
	// r.setClearColor(rgb(255), 1);

	// r.shadowMap.enabled = true;
	// r.shadowMap.type = THREE.PCFSoftShadowMap;

	// r.shadowCameraNear = 0;
	// r.shadowCameraFar = 100;
	// r.shadowCameraFov = 50;

	// r.shadowMapBias = 0.0039;
	// r.shadowMapDarkness = 0.5;
	// r.shadowMapWidth = 1024;
	// r.shadowMapHeight = 1024;

	// //r.shadowMap.type = THREE.PCFSoftShadowMap;

	// r.setPixelRatio(window.devicePixelRatio);
	// r.setSize(window.innerWidth, window.innerHeight);

	// document.body.appendChild(r.domElement);
	//#endregion old code

	var renderer = new THREE.WebGLRenderer( { antialias: antialias } );
	// renderer.setPixelRatio( window.devicePixelRatio );
	// renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	renderer.antialias = true;
	renderer.depth = App.far;
	renderer.setClearColor( App.ambient_color, 1 );
	renderer.autoClear = false;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;
	renderer.shadowMapBias = 0.0039;
	renderer.shadowMapDarkness = 0.5;
	renderer.shadowMapWidth = 1024;
	renderer.shadowMapHeight = 1024;

	document.body.appendChild( renderer.domElement );

	return renderer;
}