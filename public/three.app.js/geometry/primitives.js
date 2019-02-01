function helper( width = 0.5, height = 0.5, length = 0.5, color = undefined ) {
	if( color == undefined ) color = rgb( ri(0, 255), ri(0, 255), ri(0, 255) );
	let material = mat( 'wire', color, false );
	return box( new THREE.Vector3(width, height, length), V0, V0, material, false );
}

function box(size, position, rotation, material, shadow = false) {
	var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(position.x, position.y, position.z);
	mesh.rotation.set(rotation.x, rotation.y, rotation.z);
	mesh.castShadow = shadow;
	mesh.reciveShadow = shadow;
	return mesh;
}

function sphere(radius, position, rotation, material, shadow = false, devisions = 2) {
	var geometry = new THREE.SphereBufferGeometry(radius, devisions, devisions);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(position.x, position.y, position.z);
	mesh.rotation.set(rotation.x, rotation.y, rotation.z);
	mesh.castShadow = shadow;
	mesh.reciveShadow = shadow;
	return mesh;
}

function plane(y, step, material, shadow = false) {
	var geometry = new THREE.PlaneBufferGeometry(step * 10, step * 10, step, step);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.x = - Math.PI / 2;
	mesh.position.y = y;
	mesh.receiveShadow = shadow;
	return mesh;
}

