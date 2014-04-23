function SimpleGears() {}

SimpleGears.prototype.initialize = function () {
    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
    
    this.canvas.width = 100;
    this.canvas.height = 75;

    this.loaded = false;
};

SimpleGears.prototype.update = function (streams) {
        
    //Get the values to work with, do rounding and stuff as needed
	aGear = Math.round(streams["electrics"].gear_A*5);
    mGear = streams["engineInfo"][5];
    maxFGears = streams["engineInfo"][6];
    maxRGears = streams["engineInfo"][7];

    //start canvas stuff
    c = this.canvas[0];
	ctx = c.getContext('2d');
    
    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,100,75);
    
    sign = mGear?mGear<0?-1:1:0

    if (sign == -1) {
        gearDirStr = "R"
    } else if (sign == 1) {
        gearDirStr = "F"
    } else {
        gearDirStr = "N"
    }

    if (mGear > 0) {
        gearNumStr = Math.abs(mGear) + "/" + maxFGears;
    } else if (mGear < 0 && maxRGears > 1) {
        gearNumStr = Math.abs(mGear) + "/" + maxRGears;
    } else {
        gearNumStr = "";
    }

    //Setup Text
    ctx.font='35px "Lucida Console", Monaco, monospace';
    ctx.textAlign="center";

    //Direction
    ctx.fillStyle = "RGBA(0,0,0,0.5)";
    ctx.fillText(gearDirStr,50,35);
    
    //Gear number
    ctx.font='25px "Lucida Console", Monaco, monospace';
    ctx.fillText(gearNumStr,50,60);
};