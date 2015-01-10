function CompassPrecise() {}

CompassPrecise.prototype.initialize = function () {
	this.canvas = $('<canvas height="53px"></canvas>').appendTo(this.rootElement);
	this.canvas.width = this.rootElement.width();
    this.canvas.height = this.rootElement.height();
	
	this.compass_width = 2000; //Defines how close are markings to each other
	this.width_less = (this.compass_width-this.canvas.width)/2;
};

CompassPrecise.prototype.update = function (streams) {
	var size = Math.min(this.rootElement.height(),this.rootElement.width());
	this.heading = streams.sensors.yaw;
	var c = this.canvas[0];
    var ctx  = c.getContext('2d');

    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
	ctx.fillStyle = "rgba(0,0,0,0.8)";
	ctx.strokeStyle = "rgba(0,0,0,0.6)";

	posX=this.heading*this.compass_width/(2*Math.PI)-this.width_less;
	ctx.drawImage(this.osCanvas, posX,0);
	if(this.heading*this.compass_width/(2*Math.PI)-this.width_less>0){
		ctx.drawImage(this.osCanvas, posX-this.compass_width,0);
	}else if(posX+this.compass_width<this.rootElement.width()){
		ctx.drawImage(this.osCanvas, posX+this.compass_width,0);
	}
	
	//needle
	ctx.beginPath();
	ctx.lineWidth=2;
	ctx.strokeStyle = "rgba(0,0,0,0.7)";
	ctx.moveTo(this.canvas.width/2, 40);
	ctx.lineTo(this.canvas.width/2-5, 55);
	ctx.moveTo(this.canvas.width/2, 40);
	ctx.lineTo(this.canvas.width/2+5, 55);
	ctx.stroke();
    
};

CompassPrecise.prototype.resize = function(){
	this.canvas.width =this.rootElement.width();
	this.canvas.height=this.rootElement.height();
	var c = this.canvas[0];
	c.width = this.rootElement.width();
    c.height = this.rootElement.height();
	this.width_less = (this.compass_width-this.canvas.width)/2;
	this.generate();
};


CompassPrecise.prototype.generate = function(streams){
	var size = Math.min(this.rootElement.height(),this.rootElement.width());
	
	this.osCanvas = document.createElement('canvas'),
	
	this.osCanvas.width = this.compass_width;
	this.osCanvas.height = this.rootElement.height();
	for (var i = 0; i < 37; i++) {
		osCtx = this.osCanvas.getContext('2d');
		osCtx.font='bold 17px "Lucida Console", Monaco, monospace';
		osCtx.textAlign="center";
		osCtx.fillStyle = "rgba(0,0,0,0.5)";
		osCtx.strokeStyle = "rgba(0,0,0,0.5)";
	
		r=i*Math.PI/180*10;
		pos_x_1 = r*this.compass_width/(2*Math.PI);
		pos_x_2 = pos_x_1 + this.compass_width/72;
		
		//big lines
		osCtx.beginPath();
		osCtx.lineWidth=2;
		osCtx.moveTo(pos_x_1, 30);
		osCtx.lineTo(pos_x_1, 50);
		osCtx.stroke();
		
		//small lines
		if (i!=36){
			osCtx.beginPath();
			osCtx.lineWidth=2;
			osCtx.moveTo(pos_x_2, 30);
			osCtx.lineTo(pos_x_2, 45);
			osCtx.stroke();
		}
		
		//text
		text = i*10;
		if (text==0||text==360){
			text="N";
		}else if (text==90){
			text="E";
		}else if (text==180){
			text="S";
		}else if (text==270){
			text="W";
		}
		osCtx.fillText(text,  pos_x_1, 22);
	}
	
};