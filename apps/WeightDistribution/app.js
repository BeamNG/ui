function WeightDistribution(){}

WeightDistribution.prototype.initialize = function(){
	this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
	this.canvas.width=220;
};

WeightDistribution.prototype.update = function(streams){
	value = streams.wheelInfo;
	/* value format:
	0  wd.name
	1  wd.radius
	2  wd.wheelDir
	3  w.angularVelocity
	4  w.lastTorque
	5  drivetrain.wheelInfo[wd.wheelID].lastSlip
	6  wd.lastTorqueMode
	7  drivetrain.wheelInfo[wd.wheelID].downForce
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
	var max = 0;

	for(var j in value) {
		max += value[j][7];
	}	

	for(var i in value) {
		var w = value[i];
		var downForce = w[7];
		// then draw


		ctx.fillStyle = '#aaa';
		ctx.beginPath();
		ctx.arc(x,y,(downForce/max)*r,0,Math.PI*2,0);
		ctx.fill();

		ctx.fillStyle = '#000';

		ctx.fillText(w[0], x, y);
		filledArc(ctx, x, y, r, 1, 1, '#444444');

		ctx.fillText(Math.floor(downForce / 9.81) + ' kg'    , x, y + fontSize + 3);
		ctx.fillText(Math.floor(downForce ) + ' N', x, y + 2 * (fontSize + 3));


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