class App {

	static init() {

		{
			App.state = 'logout';
			App.debug = true;
			App.shadows = true;
			App.smooth = 0;
			App.ambient_color = rgb(240, 240, 220);
			App.fog_color = rgb(240, 240, 220);
			App.near = 0.1;
			App.fov = 50;
			App.far = 100;
			App.fog = 0.2;
		}

		Actions.init();
		Events.init();
		Keyframes.init();
		Keyboard.init();
		Mouse.init();
		Renderer.init();
		
		App.hub = new Hub();
		//App.audio = new Audio();
		App.fps = new Fps();
		App.world = new World();
		App.lights = new Lights();
		//App.physics = new Physics();

		App.camera = new Camera();
		App.camera.target.rotateZ( -Math.PI/10 );
		//App.world.scene.add( App.camera.tank );
		//this.picker = new Picker();
		/////App.mouse._onmove = App.pick;
		
		//App.add_avatars();
		//App.add_animations();
		App.add_gui_elements();

	//	App.world.scene.add( box( 1, V(0, 1, 0), V0, mat('basic'), true ) );
		resize();
		App.update();
	}

	static add_avatars() {
		
		App.avatars = new List();

		for( let i = 0; i < 1; i++ ) {
			App.avatars.add( new Avatar('avatar' + i ) );
			//if( i > 0 ) 
			{
				App.avatars.item().root.position.set( rf(-5, 5), 0.8, rf(-5, 5) );
				App.avatars.item().root.rotation.set(0, rf(0, wPI), 0);
			}
		}

		App.avatars.current = 0;

		Events.bind( 'keydown', 'App.avatars.next', ['m'] );
		Events.bind( 'keydown', 'App.avatars.item().joints.prev', ['b'] );
		Events.bind( 'keydown', 'App.avatars.item().joints.next', ['n'] );

		//Events.debug_info = true;
		Events.bind( 'keydown', 'Keyframes.add', ['k'], App.avatars.item().joints );
		//Events.debug_info = false;
	}

	static add_animations() {

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

	static add_gui_elements() {

		App.gui = new List();
		App.gui.add( new EditBox( 'EditBox0', '', [], 0, 10, 60 ) );
		App.gui.add( new EditBox( 'EditBox1', '', [], 0, 0, 10 ) );
		App.gui.item(0).element.onenter = App.input;
		//App.cmd_gui.element.focus();
	}

	static update() {

		requestAnimationFrame( App.update );

		Mouse.update();
		Actions.update();	
		//App.audio.update();
		App.fps.update();
		
		//for( let i = 0; i < App.avatars.items.length; i++) App.avatars.items[i].update();
		//log( App.avatars );

		if( App.avatars != undefined ) {
			let current_avatar = App.avatars.item();
			if( current_avatar != undefined ) {
				current_avatar.update();
				App.camera.update( current_avatar.root );
			}
		} else App.camera.update( { position: V(0, 0.8, 0) } );

		//App.physics.update();

		App.gui.item(1).element.innerHTML = crop( App.fps.fps );
		App.gui.item(0).element.style.left = window.innerWidth / 2 - App.gui.item(0).element.offsetWidth / 2  + 'px';
		App.gui.item(1).element.style.left = window.innerWidth / 2 - App.gui.item(1).element.offsetWidth / 2  + 'px';

		//log(App.avatars.item().root.rotation.y);

		Renderer.update();
	}

	static input( cmd ) {
		
		let _cmd = cmd.split(' ');
		
		if( _cmd.length == 1 ) {
			if( App.state == 'logout' ) App.hub.send( { type: 'login', name: cmd } );
			if( App.state == 'login' ) 	App.hub.send( { type: 'login', hash: App.hash + cmd } );
		}
		
		if( App.state == 'auth') { 
			
			switch(cmd) {
				
				case 'logout':
					App.hub.send( { type: 'logout' } );
					App.state = 'logout';
					break;

				default:
					App.hub.send( { type: 'message', text: cmd } );
					break;
			}
			
			{
			// switch( _cmd[ 0 ] ) {
				
				// case '$':
				// 	if( _cmd.length == 3 )
				// 		App.hub.send( { type: 'login', name: _cmd[1] } );
				// 		App.pass =  _cmd[2];
				// 	break;

				// case 'reset':
				// 	App.hub.send( { type: 'cmd', text: 'reset' } ); 
				// 	break;

				// case 'save':
				// 	App.hub.save_item( 'App.camera.position.x' );
				// 	App.hub.save_item( 'App.camera.target.rotation' ); 
				// 	//App.hub.save_item( 'App.avatars.item().root.position' );
				// 	//App.hub.save_item( 'App.avatars.item().root.rotation.y' );
				// 	//App.hub.save_func( 'App.avatars.item().test_minimum_cinc' );
				// 	break;

				// case 'run':
				// 	let func = _cmd[1];
				// 	if( _cmd[1] == 'min') func = 'App.avatars.item().test_minimum_cinc';
				// 	if( _cmd[1] == 'man') func = 'App.avatars.item().simple_men';
				// 		//old	//let context = eval( getcontext( func ) );
				// 		//old	//eval( func ).bind( context )();
				// 	run( func );
				// 	break;

				// default: 

					
					
					//App.hub.send( { type: 'message', name: cmd } );

					// break;
			// }
			}

		}

	}
}
