module.exports = function() {
	
	this.log = function( message = undefined, timestamp = true ) {
		if( message == undefined ) message = '';
		if( timestamp ) 
			console.log( ts() + '  ' + message );
		else
			console.log( message );
	}

	this.now = function() {
		let now = Date(Date.now());
		return now;//now.Hours + ':' + now.Minutes + ':' + now.Seconds;
	}

	this.ts = function () {
		var d = new Date();
		var h = ("0" + d.getHours()).slice(-2);
		var m = ("0" + d.getMinutes()).slice(-2);
		var s = ("0" + d.getSeconds()).slice(-2);
		var ms = ("000" + d.getMilliseconds()).slice(-3);
		return h + ':' + m + ':' + s + '.' + ms;
	}

	this.sleep = function( ms ) {
		ms += new Date().getTime();
		while (new Date() < ms) {}
	} 

	this.mkdir = function ( path ) {
		try {
			if( fs.existsSync( path ) ) return false;
			fs.mkdirSync( path );
			return true;
		} catch( err ) { return false; } 
	}

	// JSON stingify 
	this.js = function( obj ) {
		return JSON.stringify( obj );
	}

	// JSON parse
	this.jp = function jp( obj ) {
		return JSON.parse( obj );
	}

	// JSON copy
	this.jc = function( obj ) {
		return JSON.parse( JSON.stringify( obj ) );
	}

	// random float value
	this.ri = function( min = 0, max = 1 ) {
		return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
	}

	// random string of digits (key)
	this.rk = function( length = 4 ) {
		let r = '';
		for( let i=0; i<length; i++ ) r += ri( 0, 9 );
		return r;
	}

}