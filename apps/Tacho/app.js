function Tacho(){
	this.info = {
		title: "fancy Tacho",
		preferredSize: [300,300],
		streams: ["engineInfo", "electrics"]
	};

	this.memoryCanvas = {};
	this.font = ' "Lucida Console", Monaco, monospace ';
	this.rpmInfo = {
		rpm: 0,
		bigStep: 500,
		smallStep: 250,
		numberFactor: 0.01
	};
}

Tacho.prototype.initialize = function(){
	this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);

	this.canvas.css({
		width: '100%',
		height: '100%'
	});

	c = this.canvas[0];
	c.width = 300;
	c.height = 300;

	this.addMemoryCanvas('background');
	this.updateRPM();
	this.resize();
};

Tacho.prototype.resize = function(){
	size = Math.min(this.rootElement.height(),this.rootElement.width());
	this.canvas.height(size);
	this.canvas.width(size);

	c = this.canvas[0];
	c.width = size;
	c.height = size;

	ctx = c.getContext('2d');
	ctx.setTransform(size/300, 0, 0, size/300, 0, 0);
};

Tacho.prototype.update = function(streams){
	engineInfo = streams['engineInfo'];

		this.updateRPM();

	ctx = this.canvas[0].getContext('2d');

	ctx.drawImage(this.memoryCanvas['background'],0,0);

	ctx.save();
	
	// rpm needle

	ctx.strokeStyle = 'rgb(255,0,0)';
	ctx.lineWidth = 5;

	ctx.translate(150,150);
	ctx.rotate(rpmConverter.convertValue(streams["electrics"].rpm));
	ctx.beginPath();
	ctx.moveTo(0,-140);
	ctx.lineTo(0,-100);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();

	// speed
	speed = streams["electrics"].wheelspeed;
	if (isNaN(speed)) speed = streams["electrics"].airspeed;
	speed *= 3.6;
	

	ctx.fillStyle = 'rgb(200,200,200)';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '70px'+this.font;
	ctx.fillText((speed).toFixed(),150,150);
	ctx.font = '20px'+this.font;
	ctx.fillText('km/h',150,185);


	// gear

	if (engineInfo[5] === 0)
	{
		gear = "N";
	}else if(engineInfo[5] < 0)
	{
		gear = "R";
	}else
	{
		gear = engineInfo[5].toString();
	}

	ctx.fillStyle = 'rgb(200,200,200)';
	ctx.font = '35px'+this.font;
	ctx.fillText(gear,150,220);

	if (engineInfo[5]<0 && engineInfo[7]>1) // more than one reversegear and in reverse
	{
		ctx.font = '20px'+this.font;
		ctx.textAlign = 'left';
		ctx.fillText((engineInfo[5]*-1).toString(),162,224);
	}

	//reflection yo

	grad = ctx.createLinearGradient(0,150,150,0);
	grad.addColorStop(0,'rgba(255,255,255,0)');
	grad.addColorStop(0.5,'rgba(255,255,255,0)');
	grad.addColorStop(1,'rgba(255,255,255,0.3)');

	ctx.fillStyle = grad;

	ctx.beginPath();
	ctx.arc(150,150,147,0,2*Math.PI,true);
    ctx.fill();
	ctx.closePath();
	
};

Tacho.prototype.addMemoryCanvas = function(name)
{
	c = document.createElement('canvas');
	c.width = 300;
	c.height = 300;

	this.memoryCanvas[name] = c;
};

Tacho.prototype.updateRPM = function()
{
	if(this.rpmInfo.rpm == engineInfo[1]) return;
	
	this.rpmInfo.rpm = engineInfo[1];
	rpmConverter = new Converter(0,engineInfo[1],-(Math.PI/4)*3,(Math.PI/4)*3);

	if(this.rpmInfo.rpm <= 3000)
	{
		this.rpmInfo.bigStep = 500;
		this.rpmInfo.smallStep = 100;
		this.rpmInfo.numberFactor = 0.01;
			
	}else if(this.rpmInfo.rpm <= 5000)
	{
		this.rpmInfo.bigStep = 500;
		this.rpmInfo.smallStep = 250;
		this.rpmInfo.numberFactor = 0.01;
	}else if(this.rpmInfo.rpm <= 20000)
	{
		this.rpmInfo.bigStep = 1000;
		this.rpmInfo.smallStep = 250;
		this.rpmInfo.numberFactor = 0.001;
	}else
	{
		this.rpmInfo.bigStep = 100000;
		this.rpmInfo.smallStep = 20000;
		this.rpmInfo.numberFactor = 0.0001;
	}
		
	this.drawBackground();

};

Tacho.prototype.drawBackground = function()
{
	// Draw background
	ctx = this.memoryCanvas['background'].getContext('2d');
	// background
	ctx.save();

	ctx.beginPath();
	ctx.arc(150,150,147,0,2*Math.PI,true);
    ctx.fill();
	ctx.closePath();

	// dial

	grad = ctx.createRadialGradient(150,150,100,150,150,140);
	grad.addColorStop(0,'rgb(100,100,100)');
	grad.addColorStop(0.15,'rgb(200,200,200)');
	grad.addColorStop(0.85,'rgb(200,200,200)');
	grad.addColorStop(1,'rgb(100,100,100)');


	ctx.strokeStyle = grad;
	ctx.lineWidth = 40;

	ctx.beginPath();
	ctx.arc(150,150,120,0,2*Math.PI,false);
	ctx.stroke();
	ctx.closePath();

	
	// Unit
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '15px bold'+this.font;
	ctx.fillText('1/min',150,263);
	ctx.fillText('x'+(1/this.rpmInfo.numberFactor).toFixed(),150,277);
	ctx.restore();
	
	// redline
	
	ctx.save();
	ctx.strokeStyle = 'rgb(255,0,0)';
	ctx.lineWidth = 5;

	ctx.translate(150,150);
	ctx.rotate(rpmConverter.convertValue(this.rpmInfo.rpm));
	ctx.beginPath();
	ctx.moveTo(0,-140);
	ctx.lineTo(0,-100);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();

	// rpm markers
	ctx.save();
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '25px'+this.font;
	ctx.lineWidth = 3;
	
	ctx.translate(150,150);
	ctx.rotate(rpmConverter.convertValue(0));
	for(var i = 0 ; i <= engineInfo[1]; i += this.rpmInfo.smallStep)
	{
		if(i % this.rpmInfo.bigStep === 0)
		{
			ctx.fillText((i*this.rpmInfo.numberFactor).toFixed(),0,-118);
			ctx.beginPath();
			ctx.moveTo(0,-140);
			ctx.lineTo(0,-132);
			ctx.moveTo(0,-108);
			ctx.lineTo(0,-100);
			ctx.stroke();
			ctx.closePath();
		}else
		{
			ctx.beginPath();
			ctx.moveTo(0,-140);
			ctx.lineTo(0,-135);
			ctx.moveTo(0,-105);
			ctx.lineTo(0,-100);
			ctx.stroke();
			ctx.closePath();
		}
		ctx.rotate(rpmConverter.convertLength(this.rpmInfo.smallStep));
	}
	ctx.restore();
};