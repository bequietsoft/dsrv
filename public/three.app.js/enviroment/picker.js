class Picker {

	constructor() {
		this.raycaster = new THREE.Raycaster();
		this.obj = undefined;
		document.addEventListener( "mousemove", this.onpick.bind(this) );
	}

	onpick() {
		this.raycaster.setFromCamera( App.mouse.coords, App.camera );
		this.obj = undefined;
		for( var i = 0; i < App.world.content.length; i++ ) 
			if( App.world.content[i].pickable == true ) {
				let iobj = this.raycaster.intersectObject( App.world.content[i] );
				
				if( iobj[0] != undefined) {
					log(iobj[0].object.name);
					if( this.obj == undefined ) 
						this.obj = iobj[0];
					else
					if ( iobj[0].distance < this.obj.distance ) 
						this.obj = iobj[0];
				}
			}
	}
}