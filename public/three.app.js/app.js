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
			App.far = 100;
			App.fog = 0.2;
			App.avatar = undefined;
		}
		
		Actions.init();
		Events.init();
		Keyframes.init();
		Keyboard.init();
		Mouse.init();
		Renderer.init();
		
		App.hub = new Hub();
		App.fps = new Fps();
		App.world = new World();
		App.lights = new Lights();
		//App.audio = new Audio();
		//App.physics = new Physics();

		App.camera = new Camera();
		//App.camera.tank.rotateZ( -Math.PI/10 ); 
		App.camera.target.rotateZ( -Math.PI/10 ); 
		
		App.add_gui_elements();
		App.add_key_binds();
	
		resize();
		App.update();
	}
	
	static add_gui_elements() {
		
		App.gui = new List();
		App.gui.add( new EditBox( 'EditBox0', '', [], 2, 1, 10, 60 ) );
		App.gui.add( new EditBox( 'EditBox1', '', undefined, 0, -1, 0, 10 ) );
		App.gui.item(0).element.onenter = App.input;
		App.gui.item(0).element.focus();

		App.gui_log = function( message ) {
			if( App.debug ) log( message );
			App.gui.item(0).add( message );
		}

	}

	static add_key_binds() {
		
		let avatar = 'App.avatar.';
			Events.bind( 'keydown', ['b'], avatar + 'joints.prev' );
			Events.bind( 'keydown', ['n'], avatar + 'joints.next' );
			Events.bind( 'keydown', ['l'], avatar + 'joints.print' ); 

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

	static input( cmd ) {
		
		if( cmd == 'ss' ) cmd = 'set states'; 
		if( cmd == 'gs' ) cmd = 'get states'; 
		if( cmd == 'ds' ) cmd = 'del states';
		if( cmd == 'ps' ) cmd = 'print states';
		if( cmd.startsWith('as ') )  cmd = cmd.replace( 'as ', 'add_state ' ); 
		if( cmd.startsWith('ds ') )  cmd = cmd.replace( 'ds ', 'del_state ' );
		if( cmd.startsWith('cs ') )  cmd = cmd.replace( 'cs ', 'cur_state ' );
		if( cmd.startsWith('rs ') )  cmd = cmd.replace( 'rs ', 'run_state ' );

		let _cmd = cmd.split(' ');
		if( _cmd.length == 0 ) return;		

		if( App.hub.state == 'logout' && _cmd.length == 1 ) {
			App.hub.name = cmd;
			App.hub.send( { type: 'login', name: App.hub.name } );
			App.gui.item(0).shift();
			return;
		}
		
		if( App.hub.state == 'login' && _cmd.length == 1 ) {
			if( App.hub.name == cmd ) {
				App.hub.send( { type: 'logout', name: App.hub.name } );
				App.gui.item(0).shift();
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
						App.hub.send( { type: 'set', object: { name: _cmd[1], testdata: _cmd[1] } } );
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

				case 'print': {
					let object = App.world.content.find( _cmd[1] );
					if( object != undefined ) 
						if( object.print != undefined ) object.print();
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
		Actions.update();	
		App.fps.update();
		//App.audio.update();
		//App.physics.update();

		if( App.avatar != undefined ) {
			App.avatar.update();
			App.camera.update( App.avatar.root );
		} else 
			App.camera.update( { position: V(0, 0, 0), rotation: V(0, 0, 0) } );
		
		App.gui.item(1).element.innerHTML = crop( App.fps.fps );
		App.gui.item(0).element.style.left = window.innerWidth / 2 - App.gui.item(0).element.offsetWidth / 2  + 'px';
		App.gui.item(1).element.style.left = window.innerWidth / 2 - App.gui.item(1).element.offsetWidth / 2  + 'px';

		Renderer.update();
	}
}

