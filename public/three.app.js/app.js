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
		App.camera.target.rotateZ( -Math.PI/10 ); 
		
		App.add_gui_elements();
		App.add_key_binds();
	
		resize();
		App.update();
	}

	static log( message ) {
		if( App.debug ) log( message );
		App.gui.item(0).add( message );
	}
	
	static add_key_binds() {
		
		let avatar = 'App.avatar.';
			Events.bind( 'keydown', ['b'], avatar + 'joints.prev', undefined, undefined );
			Events.bind( 'keydown', ['n'], avatar + 'joints.next', undefined, undefined );
			Events.bind( 'keydown', ['l'], avatar + 'joints.print', undefined, undefined );
			Events.bind( 'keydown', ['1'], avatar + 'get_joints_state', 'App.state1', undefined );
			Events.bind( 'keydown', ['2'], avatar + 'get_joints_state', 'App.state2', undefined );
			Events.bind( 'keydown', ['o'], avatar + 'set_joints_state', undefined, 'App.state1' );
			Events.bind( 'keydown', ['p'], avatar + 'set_joints_state', undefined, 'App.state2' );

			Events.bind( 'keydown', ['g'], avatar + 'switch_edit', undefined, undefined );
		
		return;
		{
		let avatar = App.avatars.item();
		Events.bind( 'keydown', 'App.avatars.item().joints.next', ['n'] );
		App.joints = new List( 'joints' );
		App.j00 = new List( 'default joints' );
		App.j01 = new List( 'additional joints' );
		App.joints.add( App.j00 );
		
		if( avatar.root.torso != undefined ) {
			App.j00.add( ex( '$A.$B', [ 'position', 'rotation' ], [ 'x', 'y', 'z' ] ) );
			App.j00.add( ex( 'torso.bones[$A].position.$B', DA( 0, avatar.torso.data.bones.length - 1 ), [ 'x', 'y', 'z' ] ) );
		}

		if( avatar.test != undefined ) {
			App.j00.add( ex( '$A.$B', [ 'position', 'rotation' ], [ 'x', 'y', 'z' ] ) );
			App.j00.add( ex( 'test.bones[$A].position.$B', DA( 0, avatar.test.data.bones.length - 1 ), [ 'x', 'y', 'z' ] ) );
		}
		
		App.joints.debug_info = true;
		App.j00.debug_info = true;
		App.j01.debug_info = true;

		Events.bind( 'keydown', 'function() { console.clear(); }', 	['b', 'v', 'u', 'c', 'o', 'p'] );

		Events.bind( 'keydown', 'App.joints.item().print', 			['b'] );			// b - print current joins group
		Events.bind( 'keydown', 'App.joints.item().check_all', 		['v'] );
		Events.bind( 'keydown', 'App.joints.item().uncheck_all', 	['u'] );
		Events.bind( 'keydown', 'App.joints.item().check', 			['c'] );
		Events.bind( 'keydown', 'App.joints.item().prev', 			['o'] );
		Events.bind( 'keydown', 'App.joints.item().next', 			['p'] );

		Events.bind( 'keydown', 'App.joints.prev',		 			['['] );		// [ prev joints group
		Events.bind( 'keydown', 'App.joints.next',		 			[']'] );		// ] next joints group
	
		log( window['App'] );

		App.avatars.item().active_joint = App.joints.item().item();
		//Events.debug_info = false;

		return;

		this.collection01 = new List();
		this.collection01.add( 'position.x' );
		this.collection01.add( 'rotation.y' );
		this.collection01.debug_info = true;

		// create test Keyframes
		{
			//Keyframes.debug_info = true;
			Keyframes.add( { id: 'position_0000', items: this.collection01.get_checked(), root: 'App.avatars.item(0).root' } );
			App.avatars.item(0).root.position.x  = 1;
			App.avatars.item(0).root.rotation.y  = PI;
			Keyframes.add( { id: 'position_0001', items: this.collection01.get_checked(), root: 'App.avatars.item(0).root' } );
			App.avatars.item(0).root.position.x  = 0;
			App.avatars.item(0).root.rotation.y  = 0;
		}
 
		Events.bind( 'keydown', this.collection01.print.bind( this.collection01 ), 'b' );
		Events.bind( 'keydown', this.collection01.check.bind( this.collection01 ), 'c' );
		Events.bind( 'keydown', this.collection01.next.bind( this.collection01 ), 'n' );
		Events.bind( 'keydown', this.collection01.prev.bind( this.collection01 ), 'p' );

		let data0 = { sequence: [ 0, 1, 0 ], temps: [ 20, 20, 20 ], index: 0, root: 'App.avatars.item().root' };
		Events.bind( 'keydown', Keyframes.play, 't', data0 );

		let data1 = { sequence: [ 0, 1, 0 ], temps: [ 20, 20, 20 ], index: 0, root: 'App.avatars.item(1).root' };
		Events.bind( 'keydown', Keyframes.play, 'y', data1 );

		let data2 = { sequence: [ 0, 1, 0 ], temps: [ 20, 20, 20 ], index: 0, root: 'App.avatars.item(2).root' };
		Events.bind( 'keydown', Keyframes.play, 'u', data2 );
		}
	}

	static add_gui_elements() {
		App.gui = new List();
		App.gui.add( new EditBox( 'EditBox0', '', [], 2, 1, 10, 60 ) );
		App.gui.add( new EditBox( 'EditBox1', '', undefined, 0, -1, 0, 10 ) );
		App.gui.item(0).element.onenter = App.input;
		App.gui.item(0).element.focus();
	}

	static input( cmd ) {
		
		if( App.hub.state == 'logout' ) {
			if( App.debug ) log( 'auto login as ' + cmd );
			App.hub.name = cmd;
			App.hub.send( { type: 'login', name: App.hub.name, pass: undefined } );
			App.gui.item(0).shift();
		}
		
		if( App.hub.state == 'login' ) 
			
		switch( cmd ) {
				
				case App.hub.name: {
					App.hub.send( { type: 'logout', name: App.hub.name } );
					App.gui.item(0).shift();
					break;
				}

				default: {
					App.hub.send( { type: 'message', text: cmd } );
					App.gui.item(0).shift();
					break;
				}
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
			App.camera.update( { position: V(0, 0.8, 0) } );
		
		App.gui.item(1).element.innerHTML = crop( App.fps.fps );
		App.gui.item(0).element.style.left = window.innerWidth / 2 - App.gui.item(0).element.offsetWidth / 2  + 'px';
		App.gui.item(1).element.style.left = window.innerWidth / 2 - App.gui.item(1).element.offsetWidth / 2  + 'px';

		Renderer.update();
	}
}




// static add_avatars() {
		
	// 	App.avatar = undefined;

	// 	App.avatars = new List();
	// 	for( let i = 0; i < 1; i++ ) {
	// 		App.avatars.add( new Avatar('avatar' + i ) );
	// 		//if( i > 0 ) 
	// 		{
	// 			App.avatars.item().root.position.set( rf(-5, 5), 0.8, rf(-5, 5) );
	// 			App.avatars.item().root.rotation.set(0, rf(0, wPI), 0);
	// 		}
	// 	}

	// 	App.avatars.current = 0;

	// 	Events.bind( 'keydown', 'App.avatars.next', ['m'] );
	// 	Events.bind( 'keydown', 'App.avatars.item().joints.prev', ['b'] );
	// 	Events.bind( 'keydown', 'App.avatars.item().joints.next', ['n'] );

	// 	//Events.debug_info = true;
	// 		Events.bind( 'keydown', 'Keyframes.add', ['k'], App.avatars.item().joints );
	// 	//Events.debug_info = false;
	// }

	// static kill_avatars() {
	// 	App.avatars.items.forEach( avatar => { App.world.scene.remove( avatar.root ); });
	// 	App.avatars = undefined;
	// 	Events.init();
	// }

