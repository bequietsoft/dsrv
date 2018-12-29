// loging
function log( message = undefined ) {
	if ( message == undefined ) message = '';
	console.log( message );
	if( App.log_gui != undefined ) App.log_gui.add( message );
}

// crop digits
function crop( a, d = 2 ) {
	var m = Math.pow( 10, d );
	return Math.floor( a * m ) / m;
}

// clamp value
function clamp( v, a, b ) {
	if ( v > b ) return b;
	if ( v < a ) return a;
	return v;
}

// 2D and 3D objects to string
function p2s( a ) {
	let r = crop(a.x) + ', ' + crop(a.y);
	if ( a.z != undefined ) r += ', ' + crop(a.z);
	return '{ ' + r + ' }';
}

// array to string
function a2s( a ) {
	let r = '';
	
	if ( a == undefined ) return 'undefined';
	if ( !Array.isArray( a ) ) return a;
	if ( a.length == 0 ) return '[]';

	for ( let i = 0; i < a.length; i++) {

		//log(a[i] );

		if ( Array.isArray( a[ i ] ) ) 
			r += a2s( a[i] );// + ', ';
		else 
			if ( a[ i ].x != undefined && a[ i ].y != undefined ) 
				r += p2s( a[ i ] );
			else 
				r += a[ i ];
		
		if ( i < a.length - 1) r += ', ';
		
	}

	return '[ ' + r + ' ]';
}

// JSON stingify 
function js( obj ) {
	return JSON.stringify( obj );
}

// convert degrees to radians
function d2r( deg ) {
	return deg * Math.PI / 180;
}

// convert radians to degrees
function r2d( rad ) {
	return rad * 180 / Math.PI;
}

// random float value 0..1
function R1() { 
	return getRandomFloor(0, 1); 
}

// random floor value
function RF( min = 0, max = 1 ) {
    return Math.random() * (max - min) + min;
}

// random float value
function RI( min = 0, max = 1 ) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// random string of digits (key)
function RK( length = 4 ) {
	let r = '';
	for( let i=0; i<length; i++ ) r += RI( 0, 9 );
	return r;
}

// insert array a and b values in string s to $A and $B
function ex( s, a, b ) {

	let r = [];
	for( let ai = 0; ai < a.length; ai++ ) {
		let t = s.replace('$A', a[ai] );
		for( let bi = 0; bi < b.length; bi++ ) {
			let h = t;
			h = h.replace('$B', b[bi] );
			r.push( h );
		}
	}

	return r;
}

// array from a to b
function da( a, b ) {
	let r = [];
	for( let i = a; i <= b; i++ ) r.push( i );
	return r;
}
