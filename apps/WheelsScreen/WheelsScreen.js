function WheelsScreen(){
	this.info = {
		title: "Wheelsdebug",
		preferredSize: [260,"auto"],
		streams: ["vehicleInfo"]
	};
}

WheelsScreen.prototype.initialize = function(){
	$(this.rootElement).html("<canvas class='drawingcanvas'></canvas>");
	this.canvas = $(this.rootElement).children('.drawingcanvas')[0];
	this.canvas.width=220;
	$(this.rootElement).css("background-color","white");
};

WheelsScreen.prototype.update = function(streams){
	value = streams['vehicleInfo'][0];
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
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.restore();
	ctx.textAlign = 'center';
	var fontSize = 12;
	ctx.font = 'bold ' + fontSize + 'pt monospace';
	var r = 50;
	var rs = 5;
	var b = 5;
	var x = r + b;
	var y = r + b;
	for(var i in value) {
		var w = value[i];
		// then draw
		ctx.fillText('wheel' + w[0], x, y);
		filledArc(ctx, x, y, r, 1, 1, '#444444');

		var wheelSpeed = w[3] * w[1] * w[2];
		ctx.fillText(Math.floor(wheelSpeed * 3.6) + ' kph'    , x, y + fontSize + 3);
		ctx.fillText(Math.floor(wheelSpeed * 2.23694) + ' mph', x, y + 2 * (fontSize + 3));
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