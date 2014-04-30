function SimpleSteering(){}

SimpleSteering.prototype.initialize = function(){
	this.canvas = $('<canvas height="53px"></canvas>').appendTo(this.rootElement).addClass('canvas');

	this.unitField = $('<div></div>').appendTo(this.rootElement).addClass('unitField');
		
	this.canvas.width = 100;
	this.canvas.height = 53;

	this.loaded = false;
	
	steeringWheelImg = new Image();

	steeringWheelImg.onload = function() {
		console.log("loaded");
	};
	steeringWheelImg.src = this.path + 'steerwheel.svg';
};

SimpleSteering.prototype.update = function(streams){
		
	//Get the values to work with, do rounding and stuff as needed
	steeringVal = Math.round(streams["electrics"].steering);
	steeringRaw = Math.round(streams["electrics"].steering_input*40);
	
	//start canvas stuff
	c = this.canvas[0];
	ctx = c.getContext('2d');
	
	//clear before drawing stuff on canvas
	ctx.clearRect(0,0,100,53);
	
	//Horz display
	ctx.strokeRect(10,45,80,5);
	ctx.fillStyle = "RGBA(0,0,255,0.5)";
	ctx.fillRect(50,45,steeringRaw,5);
		
	//add some graduation lines
	for (i=0; i<5; i++) {
		ctx.beginPath();
		ctx.moveTo(10+(20*i), 40+2*(i%2)); // the last bit makes lines 1,3 smaller
		ctx.lineTo(10+(20*i), 45);
		ctx.stroke();
	};
	
	//Steering wheel display - I dont even but it works    
	ctx.save();
	ctx.translate(50, 20);
	ctx.rotate(-steeringVal*Math.PI/180);
	ctx.translate(-18, -18);
	ctx.drawImage(steeringWheelImg, 0, 0, 36, 36);
	ctx.restore();

	this.unitField.html("Steering Position");
};