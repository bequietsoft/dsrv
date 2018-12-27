class GUI1 {

	constructor( tabindex, cmd, list, top, left ) {

		log(this);
		this.element = document.createElement('div');

		this.element.style.userSelect = 'none';
		this.element.style.padding = '5pt';
		this.element.style.opacity = '0.2';
		this.element.style.fontFamily = 'consolas';
		this.element.style.color = 'black';
		this.element.style.fontSize = '16pt';
		this.element.style.backgroundColor = 'white';
		this.element.style.left = left + 'pt';
		this.element.style.top = top + 'pt';
		this.element.style.position = 'absolute';
		this.element.style.borderRadius = '20pt';
		//this.element.style.borderWidth = '2pt';
		//this.element.style.borderStyle = 'solid';
		//this.element.style.borderColor = 'white';
		this.element.tabIndex = tabindex;

		// extra parameters
		if(cmd) this.element.cmd = '';
		if(list) this.element.list = [];
		this.element.max = 5;

		if(tabindex != -1) this.element.innerHTML = '<b>_</b>';

		this.element.update = this.update;

		this.element.addEventListener("focus", this.onfocus);
		this.element.addEventListener("blur", this.onblur);
		document.getElementsByTagName('body')[0].appendChild(this.element);
    	document.addEventListener("keyup", this.onkeyup);
	}

	set( message ) 
	{
		this.element.cmd = message;
		this.element.update();
	}

	onfocus( event ) {
		
		if(this.tabIndex == -1) {
			document.body.focus();
			return;
		} 

		this.style.opacity = '0.80';
		//this.style.borderColor = 'silver';
	}

	onblur( event ) { 
		this.style.opacity = '0.20';
		//this.style.borderColor = 'white';
	}

	onkeyup( event ) { 

		var element = document.activeElement;
		if( element.tabIndex == -1 ) return;

		//log('gui: ' + e.keyCode + ' = ' + e.key);
		if( event.keyCode != 13 && event.keyCode != 8 &&
			( event.keyCode < 48 || event.keyCode > 57 ) && 
			( event.keyCode < 65 || event.keyCode > 90 ) ) return;
		
		if( event.ctrlKey != true && event.altKey != true )
			if( event.keyCode == 8 ) element.cmd = element.cmd.slice(0, -1);
			if( event.keyCode > 47 ) element.cmd += event.key;
			if( event.keyCode == 13 ) {
				if( element.list != undefined ) element.list.unshift( element.cmd );
				if( element.list.length > element.max ) element.list.pop();
				if( element.onenter != undefined ) element.onenter( element.cmd );
				element.cmd = '';
			}
		
		element.update();
	}

	update() {
		var cursor = '';
		if( this == document.activeElement && this.tabIndex != -1 ) cursor = '_';
		if( this.cmd != undefined ) this.innerHTML = '<b>' + this.cmd + cursor + '</b><br>';
		if( this.list != undefined ) this.innerHTML += this.list.join('<br>');
	}

	add( line ) {
		if( this.element.list == undefined ) return;
		this.element.list.unshift( line );
		if( this.element.list.length > this.element.max ) this.element.list.pop();
		this.element.update();
	}
}


// class Element extends HTMLDivElement {
	
// 	constructor() {

// 		super();

// 		// this.id = data.id;
		
// 		// this.style = { 
			
// 		// 	userSelect: 'none',
// 		// 	padding: '5pt',
// 		// 	opacity: '0.2',
// 		// 	fontFamily: 'consolas',
// 		// 	color: 'black',
// 		// 	fontSize: '16pt',
// 		// 	backgroundColor: 'white',
// 		// 	//left: left + 'pt',
// 		// 	//top: top + 'pt',
// 		// 	position: 'absolute',
// 		// 	borderRadius: '20pt',
// 		// 	borderWidth: '2pt',
// 		// 	borderStyle: 'solid',
// 		// 	borderColor: 'white',
// 		// 	//tabIndex: tabindex
// 		// };

// 	}

// 	update() {
// 		log( 'update ' + this.id );
// 	}
// }

class EditBox {
	
	constructor( data = { id: '', innerHTML: '', left: 0, top: 0 } ) {
		//log( this );
	}
}

class GUI {
	
	static init() {
		GUI.Elements = [];
	}

	static update() {
		
	}

	static add( element ) {
		GUI.Elements.push( element );
	}
}