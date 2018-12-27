function load() {
	App.init();
	document.addEventListener( "contextmenu", function(e) { e.preventDefault(); }, false );
}

function resize() {	
	App.camera.aspect = window.innerWidth / window.innerHeight;
	App.camera.updateProjectionMatrix();
	App.renderer.setSize( window.innerWidth, window.innerHeight );
	App.render();
}

window.addEventListener ( "resize", resize );
window.addEventListener ( "load", load );