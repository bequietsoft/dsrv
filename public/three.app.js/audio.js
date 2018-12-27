class Audio {

    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
    }

    update() {
        if( Keyboard.keys[49][0] == true ) App.audio.play( 261.63, 0 ); // 1	
        if( Keyboard.keys[50][0] == true ) App.audio.play( 293.66, 0 ); // 2
        if( Keyboard.keys[51][0] == true ) App.audio.play( 329.63, 0 ); // 3
        if( Keyboard.keys[52][0] == true ) App.audio.play( 349.23, 0 ); // 4
        if( Keyboard.keys[53][0] == true ) App.audio.play( 392.00, 0 ); // 5
        if( Keyboard.keys[54][0] == true ) App.audio.play( 440.00, 0 ); // 6
        if( Keyboard.keys[55][0] == true ) App.audio.play( 493.88, 0 ); // 7
        if( Keyboard.keys[56][0] == true ) App.audio.play( 523.25, 0 ); // 7
    }
  
    init() {
        this.oscillator = this.context.createOscillator();
        this.gain_node = this.context.createGain();

        this.oscillator.connect(this.gain_node);
        this.gain_node.connect(this.context.destination);
        this.oscillator.type = 'sine';
    }
  
    play( value, time ) {
        this.init();

        let now = this.context.currentTime;

        this.oscillator.frequency.value = value;
        this.gain_node.gain.setValueAtTime( 1, this.context.currentTime );
                
        this.oscillator.start( now + time );
        this.stop( now + time );
    }
  
    stop( time ) {
       
        this.gain_node.gain.exponentialRampToValueAtTime( 0.001, time + 1 );
        this.oscillator.stop( time + 1 );
    }
  
  }