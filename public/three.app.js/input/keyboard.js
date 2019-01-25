class Keyboard {

	static init() {
	
		Keyboard.keys = []; 				// item format: [key_code] [key_status, time]
		Keyboard.shift = [ false, 0 ];
		Keyboard.ctrl = [ false, 0 ];
		Keyboard.alt = [ false, 0 ];
		Keyboard.enabled = true;

		for ( let i = 0; i < 255; i++ ) Keyboard.keys.push( [ 0, 0 ] );

		document.addEventListener( "keydown", Keyboard.onkeydown.bind( this ) );
		document.addEventListener( "keyup", Keyboard.onkeyup.bind( this ) );
		//document.addEventListener( "keypress", Keyboard.onkeypress.bind( this ) );
	}

	static key_time( key ) {
		if ( key == undefined ) return;
		let keyCode = key.charCodeAt(0);
		if ( this.keys[ keyCode ][0] == true ) return Date.now() - this.keys[keyCode][1];
		return 0;
	}

	// static onkeypress( event ) {
	// 	if( !Keyboard.enabled ) return;

	// }

	static onkeydown ( event ) {
		if( !Keyboard.enabled ) return;
		let now = Date.now();
		if( Keyboard.shift != event.shiftKey ) Keyboard.shift = [ event.shiftKey, now ];
		if( Keyboard.ctrl != event.ctrlKey) Keyboard.ctrl = [ event.ctrlKey, now ];
		if( Keyboard.alt != event.altKey) Keyboard.alt = [ event.altKey, now ];
		if( Keyboard.keys[ event.keyCode ][0] == false ) Keyboard.keys[ event.keyCode ] = [ true, now ];
		//log( 'Key down: ' + event.keyCode + ' [' + event.key + '] all keys: ' + Keyboard.keys[ event.keyCode ].join(' ') );
		//log( Keyboard.shift[0] + '  ' + Keyboard.ctrl[0] + '   ' + Keyboard.alt[0] );
		Events.run( event );
	}

	static onkeyup( event ) {
		if( !Keyboard.enabled ) return;
		let now = Date.now();
		if( Keyboard.shift != event.shiftKey ) Keyboard.shift = [ event.shiftKey, now ];
		if( Keyboard.ctrl != event.ctrlKey) Keyboard.ctrl = [ event.ctrlKey, now ];
		if( Keyboard.alt != event.altKey) Keyboard.alt = [ event.altKey, now ];
		if( Keyboard.keys[ event.keyCode][0] == true ) Keyboard.keys[ event.keyCode ] = [ false, now ];
		//log( 'Key up: ' + event.keyCode + ' [' + event.key + '] all keys: ' + Keyboard.keys[ event.keyCode ].join(' ') );
		//log( Keyboard.shift[0] + '  ' + Keyboard.ctrl[0] + '   ' + Keyboard.alt[0] );
		Events.run( event );
	}
}
