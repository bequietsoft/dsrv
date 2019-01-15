// loging
function log( message = undefined ) {
	if ( message == undefined ) message = '';
	console.log( message );
	if( App.log_gui != undefined ) App.log_gui.add( message );
}

// 
function get_context_path( item ) {
	return item.replace( '.' + item.split('.').pop(), '' );
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

// 3D point to string 
function p2s( p ) {	
	return crop(p.x) + ', ' + crop(p.y) + ', ' + crop(p.z);
}

// JSON stingify 
function js( obj ) {
	return JSON.stringify( obj );
}

// JSON parse
function jp( obj ) {
	return JSON.parse( obj );
}

// JSON copy
function jc( obj ) {
	return JSON.parse( JSON.stringify( obj ) );
}

// // objects 1-st level properties values copy
// function ovc( src, dst ) {

// 	let src_keys = Object.keys( jp(src) );
// 	let dst_keys = Object.keys( eval(dst) );	

// 	if( src_keys.length == 0 ) { eval( dst + '=' + src ); return; }

// 	for( let si = 0; si < src_keys.length; si++ )
// 		for( let di = 0; di < dst_keys.length; di++ ) 
// 			if( src_keys[si] == dst_keys[di] ) 
// 				eval(dst)[ dst_keys[di] ] = jp(src)[ src_keys[si] ]; 
// }

// validation code for evaluation 
function ev( code ) {
	try {
		eval( code ); 
		return true;
	} catch ( error ) {
		if ( error instanceof SyntaxError ) 
			log( 'Code evaluation syntax error: ' + error.message);
		else 
			log( 'Code evaluation undefined error.' );
		return false;
	}
}

// run function from string with bind context
function run( func, context = undefined ) {
	try{
		if(context == undefined) context = get_context_path( func );
		eval( func ).bind( context ); 
	} catch ( err ) { log( err ); }
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
function r1() { 
	return getRandomFloor( 0, 1 ); 
}

// random floor value
function rf( min = 0, max = 1 ) {
    return Math.random() * ( max - min ) + min;
}

// random float value
function ri( min = 0, max = 1 ) {
  return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

// random string of digits (key)
function rk( length = 4 ) {
	let r = '';
	for( let i=0; i<length; i++ ) r += ri( 0, 9 );
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

// // 2D and 3D objects to string
// function p2s( a ) {
// 	let r = crop(a.x) + ', ' + crop(a.y);
// 	if ( a.z != undefined ) r += ', ' + crop(a.z);
// 	return '{ ' + r + ' }';
// }

// // array to string
// function a2s( a ) {
// 	let r = '';
	
// 	if ( a == undefined ) return 'undefined';
// 	if ( !Array.isArray( a ) ) return a;
// 	if ( a.length == 0 ) return '[]';

// 	for ( let i = 0; i < a.length; i++) {

// 		//log(a[i] );

// 		if ( Array.isArray( a[ i ] ) ) 
// 			r += a2s( a[i] );// + ', ';
// 		else 
// 			if ( a[ i ].x != undefined && a[ i ].y != undefined ) 
// 				r += p2s( a[ i ] );
// 			else 
// 				r += a[ i ];
		
// 		if ( i < a.length - 1) r += ', ';
		
// 	}

// 	return '[ ' + r + ' ]';
// }
