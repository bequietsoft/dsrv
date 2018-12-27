class Fps {
	constructor() {
		this._time = Date.now();
		this.time = Date.now();
		this.dtime = 0;
		this.fps = 25;
	}

	update() {
		this.time = Date.now();
		this.dtime = (this.time - this._time) / 1000;
		this.fps = ( this.fps + ( 1 / this.dtime ) ) / 2;
		this._time = this.time;
	}
}