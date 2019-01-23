function load() {
	App.init();
	//document.title = 'anonimous';
	document.addEventListener( "contextmenu", function(e) { e.preventDefault(); }, false );
}

function resize() {	
	App.camera.aspect = window.innerWidth / window.innerHeight;
	App.camera.updateProjectionMatrix();
}

window.addEventListener ( "resize", resize );
window.addEventListener ( "load", load );