function rgb(red, green = -1, blue = -1) {
	if(green + blue == -2)
		return rgb(red, red, red);
	return new THREE.Color(blue | (green << 8) | (red << 16));
}

function mat( type = 'basic', color = 'white', skinning = true ) {
	
	if(type == 'basic')
		return new THREE.MeshBasicMaterial(
		{ 
			color: color,
			skinning: skinning
		});

	if(type == 'wire')
		return new THREE.MeshBasicMaterial(
		{ 
			color: color,
			skinning: skinning,
			wireframe: true,
			transparent: true,
			opacity: 0.2
		});

	if(type == 'phong')
		return new THREE.MeshPhongMaterial(
		{ 
			color: color,
			//wireframe: true, 
			skinning: skinning,
			// aoMapIntensity: 0,
			// emissiveIntensity: 0.5,
			reflectivity: 0.5,
			shininess: 0,
			//side: THREE.DoubleSide, 
			//transparent: true,
			opacity: 1
		});
	
	if(type == 'depth')
		return new THREE.MeshDepthMaterial(
		{ 
			color: color,
			//wireframe: true, 
			skinning: skinning,
			//side: THREE.DoubleSide, 
			//transparent: true,
			opacity: 1
		});

	if(type == 'lambert')
		return new THREE.MeshLambertMaterial(
		{ 
			color: color, 
			skinning: skinning,
			side: THREE.DoubleSide 
		});

	if(type == 'standard')
		return new THREE.MeshStandardMaterial(
		{ 
			color: color, 
			skinning: skinning
			//,side: THREE.DoubleSide 
		});

		
}

function tmat( map0, map1 = undefined ) {

	let diffuse_texture = new THREE.TextureLoader().load( map0 );
	//let normals_texture = new THREE.TextureLoader().load( map1 );
	let displacement_texture = new THREE.TextureLoader().load( map1 );

	let material = mat( 'standard', rgb( 200, 200, 200 ), true );

	material.metalness = 0;
	material.roughness = 0.5;
	
	diffuse_texture.anisotropy = 10;
	material.map = diffuse_texture;

	if ( map1 != undefined ) {
		material.displacementMap = displacement_texture;
		material.displacementScale = 0.1;
		//material.displacementBias = 0.01;
		//material.bumpMap = diffuse_texture;
		material.side = THREE.DoubleSide;
	}

	return material;
}

function wire( mesh ) {
	
	// wireframe
	var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
	var mat = new THREE.LineBasicMaterial( { color: rgb(255, 255, 255), linewidth: 2 } );
	var wireframe = new THREE.LineSegments( geo, mat );
	
	mesh.add( wireframe );
}