class App {

	static init() {

		App.shadows = true;
		App.smooth = 0;
		App.ambient_color = rgb(240, 240, 220);
		App.fog_color = rgb(240, 240, 220);
		App.near = 0.1;
		App.far = 100;
		App.fog = 0.2;
		App.avatars = [];

		Actions.init();
		Events.init();
		Keyframes.init();

		Keyboard.init();
		Mouse.init();
		GUI.init();
		
		App.hub = new Hub();
		App.audio = new Audio();
		App.fps = new Fps();
		App.renderer = renderer();

		//this.picker = new Picker();
		/////App.mouse._onmove = App.pick;

		App.world = new World();
		
		App.camera = new Camera( 5, V0, 50, window.innerWidth / window.innerHeight, App.near, App.far );
		App.camera.target.rotateZ( -Math.PI/10 );
		App.world.scene.add( App.camera.target );

		App.lights = new Lights( App.world.scene );

		App.avatars.push( new Avatar('avatar0', App.world.scene ) );
		App.avatars.push( new Avatar('avatar1', App.world.scene ) );
		App.avatars.push( new Avatar('avatar2', App.world.scene ) );
		
		App.add_animation_elements();

		// App.avatar0 = new Avatar('avatar', App.world.scene );
		// App.avatar1 = new Avatar('avatar1', App.world.scene );

		App.avatars[1].root.position.set(0, 0.8, 0.5);
		App.avatars[1].root.rotation.set(0, hPI, 0);
		App.avatars[2].root.position.set(0, 0.8, -0.5);
		App.avatars[2].root.rotation.set(0, -hPI, 0);

		// App.clock = new THREE.Clock();
		// App.physics = new Physics();
		// App.physics.add_ground( App.world.scene );
		// App.physics.add_cloth( App.world.scene );
				
		resize();
		App.add_gui_elements();
		App.animate();
	}

	static add_animation_elements() {

		this.collection01 = new List();
		this.collection01.add( 'position.x', true );
		this.collection01.add( 'rotation.y', false );
		this.collection01.debug_info = true;
		// create test Keyframes
		{
			//Keyframes.debug_info = true;
			Keyframes.add( { id: 'position_0000', items: this.collection01.get_checked(), root: 'App.avatars[0].root' } );
			App.avatars[0].root.position.x  = 1;
			App.avatars[0].root.rotation.y  = PI;
			Keyframes.add( { id: 'position_0001', items: this.collection01.get_checked(), root: 'App.avatars[0].root' } );
			App.avatars[0].root.position.x  = 0;
			App.avatars[0].root.rotation.y  = 0;
		}
 
		Events.bind( 'keydown', this.collection01.print.bind( this.collection01 ), 'b' );
		Events.bind( 'keydown', this.collection01.check.bind( this.collection01 ), 'c' );
		Events.bind( 'keydown', this.collection01.next.bind( this.collection01 ), 'n' );
		Events.bind( 'keydown', this.collection01.prev.bind( this.collection01 ), 'p' );

		let data0 = { sequence: [ 0, 1, 0 ], temps: [ 20, 20, 20 ], index: 0, root: 'App.avatars[0].root' };
		Events.bind( 'keydown', Keyframes.play, 't', data0 );

		let data1 = { sequence: [ 0, 1, 0 ], temps: [ 20, 20, 20 ], index: 0, root: 'App.avatars[1].root' };
		Events.bind( 'keydown', Keyframes.play, 'y', data1 );

		let data2 = { sequence: [ 0, 1, 0 ], temps: [ 20, 20, 20 ], index: 0, root: 'App.avatars[2].root' };
		Events.bind( 'keydown', Keyframes.play, 'u', data2 );
	}

	static add_gui_elements() {

		GUI.add( new EditBox( { id: 'EditBox', innerHTML: 'Test', left: 10, top: 10 } ) );

		// App.cmd_GUI = new GUI( 1, true, true, 160, 20 );
		// App.cmd_GUI.element.onenter = function( cmd ) { App.hub.send( cmd ); }
		// //App.cmd_gui.element.focus();

		// App.fps_GUI = new GUI( -1, true, false, 20, 20 );
		// //App.log_GUI = new GUI( -1, false, true, 200, 20 );
		// //App.log_GUI.element.style.fontSize = '10pt';
	}

	static animate() {

		requestAnimationFrame( App.animate );

		Actions.update();	
		Mouse.update();
		App.avatars.forEach( avatar => { avatar.update(); } ); 
		App.audio.update();
		App.fps.update();

		let p = App.avatars[0].root.position;
		App.camera.target.position.set( p.x, p.y, p.z );
		App.camera.lookAt( p.x, p.y, p.z );

		//App.physics.update( App.clock.getDelta() );

		// App.cmd_GUI.element.style.left =  window.innerWidth / 2 - App.cmd_GUI.element.offsetWidth / 2 + 'px';
		// App.fps_GUI.set( crop( App.fps.fps, 2 ) + 'fps' );
		GUI.update();
		App.render();
	}

	static render() {
		App.renderer.clear();
		App.renderer.render( App.world.scene, App.camera );
	}
}
