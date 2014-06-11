function WheelsDebug(){}

WheelsDebug.prototype.initialize = function(){
	if(this.persistance.Unit === undefined){
		this.persistance.Unit = "metric";
		this.save();
	}

	this.data = {
		"factor":{
			"metric": 3.6,
			"imperial": 2.2369
		},
		"unitname":{
			"metric": "km/h",
			"imperial": "mph"
		}
	};

	this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
	this.canvas.width=220;

	var self = this;
	this.canvas.click(function(event) {self.toggleUnit();});
};

WheelsDebug.prototype.update = function(streams){
	value = streams.wheelInfo;
	/* value format:
	0  wd.name
	1  wd.radius
	2  wd.wheelDir
	3  w.angularVelocity
	4  w.lastTorque
	5  drivetrain.wheelInfo[wd.wheelID].lastSlip
	6  wd.lastTorqueMode
	*/
	var c = $(this.canvas)[0];
	var ctx = c.getContext('2d');

	// clear
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.textAlign = 'center';
	var fontSize = 11;
	ctx.font = fontSize + 'pt "Lucida Console", Monaco, monospace';
	var r = 50;
	var rs = 5;
	var b = 5;
	var x = r + b;
	var y = r + b;
	for(var i in value) {
		var w = value[i];
		// then draw
		ctx.fillText(w[0], x, y);
		filledArc(ctx, x, y, r, 1, 1, '#444444');

		var wheelSpeed = w[3] * w[1] * w[2];
		ctx.fillText(Math.floor(wheelSpeed * this.data.factor[this.persistance.Unit]) + ' '+this.data.unitname[this.persistance.Unit]    , x, y + fontSize + 3);
		filledArc(ctx, x, y, r - 1, rs, wheelSpeed/33, 'rgb(0,128,128)');

		filledArc(ctx, x, y, r - 1 - rs, rs, w[5]/10 , 'rgb(128,128,0)');
		
		var torque = (w[4] * w[2]) / 10000;
		var col = 'rgb(128,0,128)';
		if(w[6] == 1) {
			col = 'rgb(128,128,0)';
		} else if(w[6] == 2) {
			col = 'rgb(128,0,0)';
		}
		filledArc(ctx, x, y, r - 1 - rs * 2, rs, torque, col);


		x += 2 * r +  5;

		if(x + r >= c.width) {
			x = r + b;
			y += 2 * r + 5;
		}
	}
	y -= r;
	if(c.height < y)
	{
		c.height = y;
	}

};

WheelsDebug.prototype.toggleUnit = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance.Unit = this.persistance.Unit === 'imperial' ? 'metric' : 'imperial';
    this.save();
};