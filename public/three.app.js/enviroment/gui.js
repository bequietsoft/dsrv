class GUIElement {

	constructor( type, id, tabindex, left, top, width = undefined, height = undefined ) {
		
		this.element = document.createElement( type );
		this.element.id = id;
		this.element.style.left = left + 'pt';
		this.element.style.top = top + 'pt';
		if( width != undefined ) this.element.style.width = width;
		if( height != undefined ) this.element.style.height = height;
		this.element.tabIndex = tabindex;

		this.element.style.userSelect = 'none';
		this.element.style.padding = '5pt';
		this.element.style.opacity = '0.3';
		this.element.style.fontFamily = 'consolas';
		this.element.style.fontSize = '16pt';
		this.element.style.color = 'black';
		this.element.style.backgroundColor = 'white';
		this.element.style.position = 'absolute';
		this.element.style.borderRadius = '20pt';
		this.element.style.borderWidth = '2pt';
		this.element.style.borderStyle = 'solid';
		this.element.style.borderColor = 'silver';
	}
}

class EditBox extends GUIElement {
	
	constructor( id, cmd, list, tabindex, left, top, width = undefined, height = undefined ) {

		super( 'div', id, tabindex, left, top, width = 100, height );

		// extra parameters
		if( cmd != undefined ) this.element.cmd = cmd;
		if( list != undefined ) this.element.list = list;
		
		this.element.max = 5;
		
		if( tabindex != -1 ) this.element.innerHTML = '<b>_</b>';

		this.element.addEventListener( "focus", this.onfocus );
		this.element.addEventListener( "blur", this.onblur );
		
		this.element.update = this.update;

		document.getElementsByTagName( 'body')[0].appendChild( this.element );
		document.addEventListener( "keyup", this.onkeyup );
	}

	onfocus( event ) {
		
		//log(this);
		//this.element.cmd = '';
		if( this.tabIndex == -1 ) { document.body.focus(); return; } 
		Keyboard.enabled = false;
		this.style.opacity = '0.80';
		
	}

	onblur( event ) { 
		Keyboard.enabled = true;
		this.style.opacity = '0.30';
	}
	
	
	onkeyup( event ) { 

		var element = document.activeElement;
		if( element.tabIndex == -1 ) return;

		//log(event.keyCode);
		var keycode = event.keyCode;
		var valid = 
			( keycode >  47 && keycode <  58 ) || 	// number keys
			( keycode >  64 && keycode <  91 ) || 	// letter keys
			( keycode >  95 && keycode < 112 ) || 	// numpad keys
			( keycode > 185 && keycode < 193 ) || 	// ;=,-./` (in order)
			( keycode > 218 && keycode < 223 ) || 	// [\]' (in order)
			keycode == 32 || 						// spacebar
			keycode == 38 || 						// arrow UP
			keycode == 13 ||  						// return
			keycode == 8;   						// backspace
		if( !valid ) return;
		
		if( event.ctrlKey != true && event.altKey != true ) {

			switch ( event.keyCode ) {
				case 8: // backspace
					element.cmd = element.cmd.slice(0, -1);
					break;
				case 13: // return
					if( element.list != undefined ) element.list.unshift( element.cmd );
					if( element.list.length > element.max ) element.list.pop();
					if( element.onenter != undefined ) {
						element.blur();
						element.onenter( element.cmd );
					}
					element.cmd = '';

					break;
				case 38: // arrow UP
					if( element.list.length > 0 ) element.cmd = element.list[ element.list.length - 1 ];
					break;
				default:
					//if( event.keyCode == 32 || event.keyCode > 47 ) 
					element.cmd += event.key;
					break;
			}
		}
		
		element.update();
	}

	set( message ) 
	{
		this.element.cmd = message;		
		this.element.update();
	}

	add( line ) {
		if( this.element.list == undefined ) return;
		this.element.list.unshift( line );
		if( this.element.list.length > this.element.max ) this.element.list.pop();
		
		this.element.update();
	}

	pop() {
		if( this.element.list == undefined ) return;
		this.element.list.pop();
		this.element.update();
	}

	shift() {
		if( this.element.list == undefined ) return;
		this.element.list.shift();
		this.element.update();
	}

	update() {
		var cursor = '';
		if( this == document.activeElement && this.tabIndex != -1 ) cursor = '_';
		if( this.cmd != undefined ) this.innerHTML = '<div><b>' + this.cmd + cursor + '</b></div>';
		if( this.list != undefined ) {
			for( let i = 0; i < this.list.length; i++) 
				this.innerHTML += '<div style = "height: 12pt"><font size="2pt">' + this.list[i] + '</font></div>';
			if( this.list.length > 0 ) 
				this.innerHTML += '<div style = "height: 12pt"><font size="2pt"></font></div>';
		}
	}
}