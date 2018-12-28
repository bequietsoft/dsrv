class App {

	static init() {

		App.shadows = true;
		App.smooth = 0;
		App.ambient_color = rgb(240, 240, 220);
		App.fog_color = rgb(240, 240, 220);
		App.near = 0.1;
		App.fov = 50;
		App.far = 100;
		App.fog = 0.2;
		App.avatars = [];

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
		
		App.add_avatars();
		App.add_animation();
		App.add_gui();

		App.update();
	}

	static add_avatars() {
		
		App.avatars = new List();

		App.avatars.add( new Avatar('avatar0', App.world.scene ) );
		App.avatars.add( new Avatar('avatar1', App.world.scene ) );
		App.avatars.add( new Avatar('avatar2', App.world.scene ) );
		
		App.avatars.item(1).root.position.set(0, 0.8, 0.5);
		App.avatars.item(1).root.rotation.set(0, hPI, 0);
		App.avatars.item(2).root.position.set(0, 0.8, -0.5);
		App.avatars.item(2).root.rotation.set(0, -hPI, 0);

		App.avatars.current = 0;

		Events.bind( 'keydown', App.avatars.next.bind( App.avatars ), 'x' );
	}

	static add_animation() {

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

	static add_gui() {

		App.gui = new List();
		App.gui.add( new EditBox( 'EditBox', '', [], 0, 10, 10 ) );
		App.gui.add( new EditBox( 'EditBox', '', [], 0, 10, 10 ) );
			// App.cmd_GUI = new GUI( 1, true, true, 160, 20 );
		log(App.gui);
		App.gui.item(1).element.onenter = function( cmd ) { App.hub.send( cmd ); }
			// //App.cmd_gui.element.focus();

			// App.fps_GUI = new GUI( -1, true, false, 20, 20 );
			// //App.log_GUI = new GUI( -1, false, true, 200, 20 );
			// //App.log_GUI.element.style.fontSize = '10pt';
	}



	static update() {

		requestAnimationFrame( App.update );

		Mouse.update();
		Actions.update();	
		//App.audio.update();
		App.fps.update();
		App.avatars.item().update();
		App.camera.update( App.avatars.item().root );
		//App.physics.update();
		
		App.gui.items[0].update();
		Renderer.update();
	}
}
