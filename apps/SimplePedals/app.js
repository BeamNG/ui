function SimplePedals(){}

SimplePedals.prototype.initialize = function(){
	this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
        
	this.canvas.width = 100;
	this.canvas.height = 75;

    this.loaded = false;
};

SimplePedals.prototype.update = function(streams){
     
    
    //Get the values to work with, do rounding and stuff as needed
	throttleVal = Math.round(streams["electrics"].throttle * 100);
	brakeVal = Math.round(streams["electrics"].brake * 100);
	clutchVal = Math.round(streams["electrics"].clutch * 100 + 0.49);
    parkingVal = Math.round(streams["electrics"].parkingbrake * 100);
    
    //start canvas stuff
    c = this.canvas[0];
	ctx = c.getContext('2d');
        
    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,100,75);
    
    //background rectangle
    ctx.fillStyle = "RGBA(255,255,255,0.75)";
    ctx.fillRect(0,0,100,75);
    
    //clutch
    ctx.fillStyle = "RGBA(0,0,128,0.5)";
    ctx.fillRect(14,55,15,-clutchVal/2);
    
    //brake
    ctx.fillStyle = "RGBA(128,0,0,0.5)";
    ctx.fillRect(33,55,15,-brakeVal/2);
    
    //throttle
    ctx.fillStyle = "RGBA(0,128,0,0.5)";
    ctx.fillRect(52,55,15,-throttleVal/2);
    
    //pbrake
    ctx.fillStyle = "RGBA(128,128,0,0.5)";
    ctx.fillRect(71,55,15,-parkingVal/2);
    
    //addtext
    ctx.font='8px "Lucida Console", Monaco, monospace';
    ctx.textAlign="center";
    
    ctx.fillStyle = "black";
    ctx.fillText(clutchVal,21.5,65);
    ctx.fillText(brakeVal,40.5,65);
    ctx.fillText(throttleVal,59.5,65);
    ctx.fillText(parkingVal,78.5,65);
    
    //add borders
    ctx.strokeStyle = "black";
    ctx.strokeRect(52,30+25,15,-50);
    ctx.strokeRect(33,30+25,15,-50);
    ctx.strokeRect(14,30+25,15,-50);
    ctx.strokeRect(71,30+25,15,-50);
};











