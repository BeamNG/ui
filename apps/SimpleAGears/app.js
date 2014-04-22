function SimpleAGears() {}

SimpleAGears.prototype.initialize = function () {
	this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
        
	this.canvas.width = 200;
	this.canvas.height = 30;

    this.loaded = false;
};

SimpleAGears.prototype.update = function (streams) {
        
    //Get the values to work with, do rounding and stuff as needed
	aGear = Math.round(streams["electrics"].gear_A*5);
    
    gearNames = ["P","R","N","D","2","1"];
                
    //start canvas stuff
    c = this.canvas[0];
	ctx = c.getContext('2d');
    
    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,200,30);
    
    //Setup Text
    ctx.font='20px "Lucida Console", Monaco, monospace';
    ctx.textAlign="center";
    
    //deselected gears
    ctx.fillStyle = "RGBA(0,0,0,0.5)";
    ctx.fillText(gearNames[0],25,20);
    ctx.fillText(gearNames[1],55,20);
    ctx.fillText(gearNames[2],85,20);
    ctx.fillText(gearNames[3],115,20);
    ctx.fillText(gearNames[4],145,20);
    ctx.fillText(gearNames[5],175,20);
    
    //remove stuff over current gear
    ctx.clearRect((aGear*30)+15,0,20,30);
    //readd bg
    ctx.fillStyle = "RGBA(255,255,255,0.75)";
    ctx.fillRect((aGear*30)+15,4,20,20);
    
    //add box around gear
    ctx.strokeRect((aGear*30)+15,4,20,20);
    
    //add current gear back in selected colour
    ctx.fillStyle = "RGBA(0,0,128,0.5)";
    ctx.fillText(gearNames[aGear],(aGear*30)+25,20);    
};