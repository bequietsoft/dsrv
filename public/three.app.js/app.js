class App {

	static init() {

		{
			App.debug = undefined;
			App.shadows = true;
			App.smooth = 0;
			App.ambient_color = rgb(240, 240, 220);
			App.fog_color = rgb(240, 240, 220);
			App.shadow_map_size = 1024;
			App.shadow_camera_size = 20;
			App.near = 0.1;
			App.fov = 50;
			App.far = 50;
			App.fog = 0.2;
			App.avatar = undefined;
		}
		
		//Actions.init();
		Events.init();
		//Keyframes.init();
		Keyboard.init();
		Mouse.init();
		Renderer.init();
		
		App.hub = new Hub();
		App.fps = new Fps();
		App.world = new World();
		App.lights = new Lights();
		//App.audio = new Audio();
		//App.physics = new Physics();

		App.camera = new Camera( App.world.scene, 5, V( 0, 0, -Math.PI/10 ), false );
		
		App.init_events_binds();
		App.init_gui_elements();
	
		on_window_resize();
		App.update();
	}
	
	static init_events_binds() {
		
		let avatar = 'App.avatar.';
			Events.bind( 'keydown', ['b'], avatar + 'joints.prev' );
			Events.bind( 'keydown', ['n'], avatar + 'joints.next' );
			// Events.bind( 'keydown', ['h'], avatar + 'joints.prev' );
			// Events.bind( 'keydown', ['j'], avatar + 'joints.next' );
			Events.bind( 'keydown', ['p'], avatar + 'joints.print' ); 
			Events.bind( 'keydown', ['='], avatar + 'switch_details' ); 

			Events.bind( 'keydown', ['0'], 'function() { ' + avatar + 'targetstate = "state0"; }' );
			Events.bind( 'keydown', ['1'], 'function() { ' + avatar + 'targetstate = "state1"; }' );
			Events.bind( 'keydown', ['2'], 'function() { ' + avatar + 'targetstate = "state2"; }' );
			Events.bind( 'keydown', ['3'], 'function() { ' + avatar + 'targetstate = "state3"; }' );
			Events.bind( 'keydown', ['4'], 'function() { ' + avatar + 'targetstate = "state4"; }' );
			Events.bind( 'keydown', ['5'], 'function() { ' + avatar + 'targetstate = "state4"; }' );
			Events.bind( 'keydown', ['6'], 'function() { ' + avatar + 'targetstate = "state6"; }' );
			Events.bind( 'keydown', ['7'], 'function() { ' + avatar + 'targetstate = "state7"; }' );
			Events.bind( 'keydown', ['8'], 'function() { ' + avatar + 'targetstate = "state8"; }' );
			Events.bind( 'keydown', ['9'], 'function() { ' + avatar + 'targetstate = "state9"; }' );

			Events.bind( 'keydown', ['0'], 'function() { ' + avatar + 'targetspeed = 0.10000; }' );
			Events.bind( 'keydown', ['1'], 'function() { ' + avatar + 'targetspeed = 0.05000; }' );
			
			Events.bind( 'keydown', ['g'], avatar + 'switch_edit' );
	}

	static init_gui_elements() {
		
		App.gui = new List();
		App.gui.add( new EditBox( 'CMD_EDIT_BOX', '', [], 2, 1, 10, 60 ) );
		App.gui.add( new EditBox( 'FPS_LABEL', '', undefined, 0, -1, 0, 10 ) );
		App.gui.item(0).element.onenter = App.cmd_gui_input;
		App.gui.item(0).element.focus();

		App.gui_log = function( message, use_max ) {
			if( App.debug ) log( message, use_max );
			App.gui.item(0).add( message, use_max );
		}

	}

	static cmd_gui_input( cmd ) {
		
		if( cmd == 'ss' ) cmd = 'set states'; 
		if( cmd == 'gs' ) cmd = 'get states'; 
		if( cmd == 'ds' ) cmd = 'del states';
		if( cmd == 'ps' ) cmd = 'prt states';
		if( cmd == '?' ) cmd = 'help';
		
		if( cmd.startsWith('as ') )  cmd = cmd.replace( 'as ', 'add_state ' ); 
		if( cmd.startsWith('ds ') )  cmd = cmd.replace( 'ds ', 'del_state ' );
		if( cmd.startsWith('cs ') )  cmd = cmd.replace( 'cs ', 'cur_state ' );
		if( cmd.startsWith('rs ') )  cmd = cmd.replace( 'rs ', 'run_state ' );

		let _cmd = cmd.split(' ');
		if( _cmd.length == 0 ) return;		

		if( cmd == 'help' ) {

			App.gui_log('', false );

			App.gui_log( 'login_name                         login / unlogin to / from server', false );
			App.gui_log( 'any_message_text                   send message to all', false );
			App.gui_log( 'lst                                objects names list', false );
			App.gui_log( 'set object_name                    set object to server', false );
			App.gui_log( 'get object_name                    get object from server', false );
			App.gui_log( 'del object_name                    delete object on server', false );
			App.gui_log( 'prt object_name                    print object to console', false );

			App.gui_log('', false );

			App.gui_log( 'ss    /    set states              set states to server', false );
			App.gui_log( 'gs    /    get states              get states from server', false );
			App.gui_log( 'ds    /    del states              del states from server', false );
			App.gui_log( 'ps    /    prt states              print states to server', false );

			App.gui_log('', false );

			App.gui_log( 'as    /    add_state state_name    add state', false );
			App.gui_log( 'ds    /    del_state state_name    delete state', false );
			App.gui_log( 'cs    /    cur_state state_name    set current state', false );
			App.gui_log( 'rs    /    run_state state_name    run state', false );
			
			return;
		}

		if( _cmd.length == 1 ) {
			if( cmd == 'lst' ) { 
				App.world.content.items.forEach( item => {
					let type = item.__proto__.constructor.name;
					App.gui_log( 'Object: ' + type + ' "' + item.name + '"', false );
				});
				if( App.world.content.items.length == 0 ) App.gui_log( 'no objects found in global content scope', false );
				return; 
			}
		}

		if( App.hub.state == 'logout' && _cmd.length == 1 ) {
			App.hub.name = cmd;
			App.hub.send( { type: 'login', name: App.hub.name } );
			//	App.gui.item(0).shift();
			return;
		}
		
		if( App.hub.state == 'login' && _cmd.length == 1 ) {
			if( cmd == App.hub.name ) {
				App.hub.send( { type: 'logout', name: App.hub.name } );
				//App.gui.item(0).shift();
				return;
			}
		}

		if( App.hub.state == 'login' && _cmd.length == 2 ) {

			switch( _cmd[0] ) {
				
				case 'set': {
					let object = App.world.content.find( _cmd[1] );
					if( object != undefined ) 
					 	App.hub.send( { type: 'set', object: object } );
					else 
						App.gui_log( 'object ' + _cmd[1] + ' not found' );
						//???? App.hub.send( { type: 'set', object: { name: _cmd[1], testdata: _cmd[1] } } );
					break;
				}

				case 'get': {
					App.hub.send( { type: 'get', name: _cmd[1] } );
					break;
				}

				case 'del': {
					App.hub.send( { type: 'del', name: _cmd[1] } );
					break;
				}

				case 'prt': {
					
					let object = App.world.content.find( _cmd[1] );
					let obj_type = object.__proto__.constructor.name;
					if( object != undefined ) 
						if( object.items != undefined ) {
							object.items.forEach( item => {
								let type = item.__proto__.constructor.name;
								App.gui_log( obj_type + ' "' + object.name + '" item = ' + type + ' "' + item.name + '"', false );
							});
						} else App.gui_log( obj_type + ' "' + object.name + '"', false );
					else 
						App.gui_log( 'object ' + _cmd[1] + ' not found' );
					break;
				}

				case 'add_state': {
					if( App.avatar == undefined ) return;
					App.avatar.joints.addstate( _cmd[1] );
					break;
				}

				case 'del_state': {
					if( App.avatar == undefined ) return;
					App.avatar.joints.delstate( _cmd[1] );
					break;
				}

				case 'cur_state': {
					if( App.avatar == undefined ) return;
					App.avatar.joints.setcurstate( _cmd[1] );
					break;
				}

				case 'run_state': {
					if( App.avatar == undefined ) return;
					App.avatar.joints.runstate( _cmd[1], 1, true, false );
					break;
				}

			}
			return;
		}

		if( App.hub.state == 'login' ) {
			App.hub.send( { type: 'message', text: cmd } );
			App.gui.item(0).shift();
		}
	}

	static update() {

		requestAnimationFrame( App.update );

		Mouse.update();
		//Actions.update();	
		App.fps.update();
		//App.audio.update();
		//App.physics.update();

		// if( App.avatar != undefined ) {
		// 	App.avatar.update();
		// 	//log( App.avatar.camera_target, false );
		// 	App.camera.update( App.avatar.camera_target );
		// } else 
		// 	App.camera.update( { position: V0, rotation: V0 } );
		if( App.avatar != undefined ) App.avatar.update();
		//App.camera.update();

		App.gui.item(1).element.innerHTML = crop( App.fps.fps );
		App.gui.item(0).element.style.left = window.innerWidth / 2 - App.gui.item(0).element.offsetWidth / 2  + 'px';
		App.gui.item(1).element.style.left = window.innerWidth / 2 - App.gui.item(1).element.offsetWidth / 2  + 'px';

		Renderer.update();
	}
}

window.addEventListener ( "resize", on_window_resize );
window.addEventListener ( "load", on_window_load );

function on_window_load() {

	App.init();

	// dlog( WEBVR.getVRDisplay );
	//document.body.appendChild( WEBVR.createButton( Renderer.instance ) );

	document.addEventListener( "contextmenu", function(e) { 
		e.preventDefault(); }, false );

	window.addEventListener( "mousewheel", function(e) {  
		if ( e.ctrlKey == true ) e.preventDefault(); }, false );
}

function on_window_resize() {	
	App.camera.aspect = window.innerWidth / window.innerHeight;
	App.camera.updateProjectionMatrix();
}
