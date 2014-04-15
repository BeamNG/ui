function SimpleSteering(){}

SimpleSteering.prototype.initialize = function(){
	this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
        
	this.canvas.width = 100;
	this.canvas.height = 75;

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
    ctx.clearRect(0,0,100,75);
    
    //Horz display
    ctx.strokeRect(10,60,80,5);
    ctx.fillStyle = "RGBA(0,0,128,0.5)";
    ctx.fillRect(50,60,steeringRaw,5);
        
    //some lines or somert
    ctx.beginPath();
    ctx.moveTo(10, 56);
    ctx.lineTo(10, 60);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(90, 56);
    ctx.lineTo(90, 60);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(30, 58);
    ctx.lineTo(30, 60);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(70, 58);
    ctx.lineTo(70, 60);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(50, 56);
    ctx.lineTo(50, 65);
    ctx.stroke();
    
    //Steering wheel display - I dont even but it works    
    ctx.save();
    ctx.translate(50, 30);
    ctx.rotate(-steeringVal*Math.PI/180);
    ctx.translate(-25, -25);
    ctx.drawImage(steeringWheelImg, 0, 0, 50, 50);
    ctx.restore();
};