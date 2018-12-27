
function test_cinc01() {
	var cm = new CinctureMesh(
		[
			new Cincture( [0.30, 0.30, 0.30, 0.30], [0.00, 0.00, 0.00], [0.00, 0.00, 0.00] ),
			new Cincture( [0.30, 0.30, 0.30, 0.30], [0.00, 0.20, 0.00], [0.00, 0.00, 0.00] ),
			new Cincture( [0.30, 0.30, 0.30, 0.30], [0.00, 0.20, 0.00], [0.00, 0.00, 0.00] ),
			new Cincture( [0.30, 0.30, 0.30, 0.30], [0.00, 0.20, 0.00], [0.00, 0.00, 0.00] ),
			new Cincture( [0.30, 0.30, 0.30, 0.30], [0.00, 0.20, 0.00], [0.00, 0.00, 0.00] )
			
		], 
		mat('lambert', rgb(200, 180, 150), true), // material
		0.5,	 	// smooth
		1.0,		// start cap
		1.0,	 	// end cap
		true,		// shadows cast
		false		// shadows recive
	);
    
	return cm;
}

function test_cinc02() {
	var cm = new CinctureMesh(
		mat('phong', rgb(200, 180, 150), true), 
		[
			new Cincture( [0.30, 0.30, 0.30, 0.30, 0.30, 0.30], [0.00, 0.00, 0.00], [0.00, 0.00, 0.00] ),
			new Cincture( [0.30, 0.30, 0.30, 0.30, 0.30, 0.30], [0.00, 0.50, 0.00], [0.00, 0.00, 0.00] ),
			new Cincture( [0.30, 0.30, 0.30, 0.30, 0.30, 0.30], [0.00, 0.05, 0.00], [0.00, 0.00, 0.00] ),
			new Cincture( [0.30, 0.30, 0.30, 0.30, 0.30, 0.30], [0.00, 0.05, 0.00], [0.00, 0.00, 0.00] ),
			new Cincture( [0.30, 0.30, 0.30, 0.30, 0.30, 0.30], [0.00, 0.05, 0.00], [0.00, 0.00, 0.00] ),
			new Cincture( [0.30, 0.30, 0.30, 0.30, 0.30, 0.30], [0.00, 0.50, 0.00], [0.00, 0.00, 0.00] ),
		], 
		true, 
		true, 
		0, 
		true
	);
    
	return cm;
}

function test_cinc(smooth = 1) {

	var s01 = 0.2;
	var r01 = getRandomFloor(0.0, 0.1);
	var r02 = getRandomFloor(0.5, 0,6);

	var tc = [];
	for(let i = 0; i < getRandomInt(10, 40); i++) 
		tc.push(s01 + getRandomFloor(0.0, 0.1));

	//log(r01 + ' ' + r02);
	var ctr01 = new CinctureMesh(//App.scene, 
		mat('white phong'), 
		//mat('white lambert skining'),
		[
			new Cincture( tc, [0.0, r02, 0.0], [0.0, 0.0, 0.0] ),
			new Cincture( tc, [0.0, r02, 0.0], [r01, 0.0, 0.0] ),
			new Cincture( tc, [0.0, r02, 0.0], [r01, 0.0, 0.0] ),
			new Cincture( tc, [0.0, r02, 0.0], [r01, 0.0, 0.0] ),
			new Cincture( tc, [0.0, r02, 0.0], [r01, 0.0, 0.0] )
    	], true, true, smooth, true);
    
	//log(ctr01);

	return ctr01;
}