let ud = undefined;

// loging
function log( message = undefined, timestamp = true ) {
	if( !App.debug ) return;

	if( this.caller == null ) {
		//console.log( this );
		_log( message, timestamp )
	}
	else {
		//console.log( this );
		//console.log( this.caller );
		_log( message, timestamp).bind( this.caller );
	}
}

function _log( message = undefined, timestamp = true ) {
	
	if( message == undefined ) { message = ''; timestamp = false; }
	
	if( timestamp ) 
		console.log( ts() + '  ' + message );
	else 
		console.log( message );

	if( App.log_gui != undefined ) App.log_gui.add( message );
}

function dlog( message ) {
	console.log( message );
}

// time-stamp
function ts() {
	var d = new Date();
	var h = ("0" + d.getHours()).slice(-2);
	var m = ("0" + d.getMinutes()).slice(-2);
	var s = ("0" + d.getSeconds()).slice(-2);
	var ms = ("000" + d.getMilliseconds()).slice(-3);
	return h + ':' + m + ':' + s + '.' + ms;
}

// //
// function sleep( ms ) {
// 	ms += new Date().getTime();
// 	while (new Date() < ms) {}
// } 

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

// validation code for evaluation 
function ev( code ) {
	//log( 'eval code: ' + code, false );
	try {
		eval( code ); 
		return true;
	} catch ( error ) {
		if( App.debug )
			if ( error instanceof SyntaxError ) 
				log( 'Code evaluation syntax error: ' + error.message);
			else 
				log( 'Code evaluation undefined error.' );
		return false;
	}
}

// run function from string with bind context - UNUSED?
function run( func, context = undefined ) {
	try {
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

// random floor value
function rf( min = 0, max = 1 ) {
    return Math.random() * ( max - min ) + min;
}

// random integer value
function ri( min = 0, max = 1 ) {
  return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

// random string of digits (key)
function rk( length = 4 ) {
	let r = '';
	for( let i=0; i<length; i++ ) r += ri( 0, 9 );
	return r;
}

// // insert array a and b values in string s to $A and $B
// function ex( s, a, b ) {

// 	let r = [];
// 	for( let ai = 0; ai < a.length; ai++ ) {
// 		let t = s.replace('$A', a[ai] );
// 		for( let bi = 0; bi < b.length; bi++ ) {
// 			let h = t;
// 			h = h.replace('$B', b[bi] );
// 			r.push( h );
// 		}
// 	}

// 	return r;
// }

// array from a to b
function da( a, b ) {
	let r = [];
	for( let i = a; i <= b; i++ ) r.push( i );
	return r;
}
