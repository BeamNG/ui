function Tacho(){
	this.info = {
		title: "fancy Tacho",
		preferredSize: [400,380],
		streams: ["vehicleInfo", "electrics"]
	};

	this.hudMemoryCanvas = {};
	this.hudFont = ' "Lucida Console", Monaco, monospace ';
	this.hudRpmInfo = {
		rpm: 0,
		bigStep: 500,
		smallStep: 250,
		numberFactor: 0.01
	};
}

Tacho.prototype.initialize = function(){
	$(this.rootElement).append('<canvas id="hudCanvas"></canvas>');

	$("#hudCanvas").css({
		width: '100%',
		height: '100%'
	});

	c = $("#hudCanvas")[0];
	c.width = 300;
	c.height = 300;

	this.hudAddMemoryCanvas('background');
};

Tacho.prototype.resize = function(){
	//console.log($(this.rootElement).height());
	//var c = $("#hudCanvas")[0];
	//c.width = $(this.rootElement).width();
	//c.height = $(this.rootElement).height();
	//this.update();
}

Tacho.prototype.update = function(streams){
//	$(this.rootElement).html("rpm: "+streams["vehicleInfo"][1][4].toFixed() + "<br /> Speed: "+(streams["electrics"]["wheelspeed"]*3.6).toFixed());//streams["vehicleinfo"]);
	wheelInfo = streams['vehicleInfo'][0];
	engineInfo = streams['vehicleInfo'][1];

		this.hudUpdateRPM();

	ctx = $("#hudCanvas")[0].getContext('2d');

	ctx.drawImage(this.hudMemoryCanvas['background'],0,0);

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
	
	ctx.save();
	ctx.fillStyle = 'rgb(200,200,200)';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '70px'+this.hudFont;
	ctx.fillText((speed).toFixed(),150,150);
	ctx.font = '20px'+this.hudFont;
	ctx.fillText('km/h',150,185);


	// gear

	if (engineInfo[5] == 0)
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
	ctx.font = '35px'+this.hudFont;
	ctx.fillText(gear,150,220);

	if (engineInfo[5]<0 && engineInfo[7]>1) // more than one reversegear and in reverse
	{
		ctx.font = '20px'+hudFont;
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
	
	ctx.restore();
};

Tacho.prototype.hudAddMemoryCanvas = function(name)
{
	c = document.createElement('canvas');
	c.width = 300;
	c.height = 300;

	this.hudMemoryCanvas[name] = c;
};

Tacho.prototype.hudUpdateRPM = function()
{
	if(this.hudRpmInfo.rpm == engineInfo[1]) return;
	
	this.hudRpmInfo.rpm = engineInfo[1];
	rpmConverter = new Converter(0,engineInfo[1],-(Math.PI/4)*3,(Math.PI/4)*3);

	if(this.hudRpmInfo.rpm <= 3000)
	{
		this.hudRpmInfo.bigStep = 500;
		this.hudRpmInfo.smallStep = 100;
		this.hudRpmInfo.numberFactor = 0.01;
			
	}else if(this.hudRpmInfo.rpm <= 5000)
	{
		this.hudRpmInfo.bigStep = 500;
		this.hudRpmInfo.smallStep = 250;
		this.hudRpmInfo.numberFactor = 0.01;
	}else if(this.hudRpmInfo.rpm <= 20000)
	{
		this.hudRpmInfo.bigStep = 1000;
		this.hudRpmInfo.smallStep = 250;
		this.hudRpmInfo.numberFactor = 0.001;
	}else
	{
		this.hudRpmInfo.bigStep = 100000;
		this.hudRpmInfo.smallStep = 20000;
		this.hudRpmInfo.numberFactor = 0.0001;	
	}
		
	this.hudDrawBackground();

};

Tacho.prototype.hudDrawBackground = function()
{
	// Draw background
	ctx = this.hudMemoryCanvas['background'].getContext('2d');
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
	ctx.font = '15px bold'+this.hudFont;
	ctx.fillText('1/min',150,263);
	ctx.fillText('x'+(1/this.hudRpmInfo.numberFactor).toFixed(),150,277);
	ctx.restore();
	
	// redline
	
	ctx.save();
	ctx.strokeStyle = 'rgb(255,0,0)';
	ctx.lineWidth = 5;

	ctx.translate(150,150);
	ctx.rotate(rpmConverter.convertValue(this.hudRpmInfo.rpm));
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
	ctx.font = '25px'+this.hudFont;
	ctx.lineWidth = 3;
	
	ctx.translate(150,150);
	ctx.rotate(rpmConverter.convertValue(0));
	for(var i = 0 ; i<=engineInfo[1]; i+=this.hudRpmInfo.smallStep)
	{
		if(i % this.hudRpmInfo.bigStep==0)
		{
			ctx.fillText((i*this.hudRpmInfo.numberFactor).toFixed(),0,-118);
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
		ctx.rotate(rpmConverter.convertLength(this.hudRpmInfo.smallStep));
	}
	ctx.restore();	
};


function Converter(inMin, inMax, outMin, outMax)
{
	this.inMin = inMin;
	this.inMax = inMax;
	this.inLength = inMax - inMin;
	this.outMin = outMin;
	this.outMax = outMax;
	this.outLength = outMax- outMin;
}
Converter.prototype.convertValue = function(value)
{
	if(value<this.inMin) valueIn = this.inMin;
	if(value>this.inMax) valueIn = this.inMax;
	return (value/this.inLength)*this.outLength + this.outMin;
};
Converter.prototype.convertLength = function(length)
{
	return (length/this.inLength)*this.outLength;
};