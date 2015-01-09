function Compass(){}

Compass.prototype.initialize = function(){
    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
	this.canvas.width(100);
    this.canvas.height(100);
    this.textElement = $('<div></div>').appendTo(this.rootElement);
	this.labels = ["W","N","E","S"]

    this.resize();
	
};

Compass.prototype.update = function(streams){
	var size = Math.min(this.rootElement.height(),this.rootElement.width());
    this.heading = streams.sensors.yaw;
    
	var c = this.canvas[0];
    var ctx  = c.getContext('2d');

	ctx.save();
    ctx.clearRect(-size/2,-size/2,size,size);
	ctx.rotate(this.heading+Math.PI/2);
	
	//We create an off-screen canvas and display it treating it as an "image".
	ctx.drawImage(this.osCanvas, -size/2,-size/2);
	
	//Needle
	ctx.restore();
	ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
	ctx.beginPath();
    ctx.moveTo(0,-size*0.125);
    ctx.lineTo(-size*0.05,size*0.075);
    ctx.lineTo( size*0.05,size*0.075);
	ctx.fill();
};

Compass.prototype.resize = function(){
    var size = Math.min(this.rootElement.height(),this.rootElement.width());
    this.canvas.height(size);
    this.canvas.width(size);

    var c = this.canvas[0];
    c.width = size;
    c.height = size;

    var ctx = c.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, size/2, size/2);
	
	this.generate();
};

Compass.prototype.generate = function(streams){
	var size = Math.min(this.rootElement.height(),this.rootElement.width());
	
	this.osCanvas = document.createElement('canvas'),
    osCtx = this.osCanvas.getContext('2d');
	
	this.osCanvas.width = size;
	this.osCanvas.height = size;
	

	osCtx.setTransform(1, 0, 0, 1, size/2, size/2);
	
    osCtx.clearRect(-size/2,-size/2,size,size);
	
	osCtx.fillStyle = "rgba(255, 255, 255, 0.9)";
	osCtx.strokeStyle = "rgba(0,0,0,0.6)";
	osCtx.lineWidth=3;
	
	osCtx.beginPath();
    osCtx.arc(0,0,95/2*0.01*size,0,2*Math.PI,false);
	osCtx.fill();
	osCtx.stroke();
	
	osCtx.fillStyle = "rgba(0, 0, 0, 0.6)";
    osCtx.font='bold '+toInt(size*0.2)+'px "Lucida Console", Monaco, monospace';
    osCtx.textAlign="center";
	osCtx.textBaseline="middle"; 
	osCtx.save();
	
	for (i = 0; i < 4; i++) {
		pos_x = -65/2*0.01*size * Math.sin(Math.PI);
		pos_y = 65/2*0.01*size * Math.cos(Math.PI);
		osCtx.fillText(this.labels[i],  pos_x, pos_y);
		
		osCtx.rotate(Math.PI/2);
	}
};

