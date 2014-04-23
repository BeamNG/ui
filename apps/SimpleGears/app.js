function SimpleGears() {}

SimpleGears.prototype.initialize = function () {
    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
    
    this.canvas.width = 100;
    this.canvas.height = 75;

    this.loaded = false;
    
    var self = this;
    this.rootElement.click(function(){self.toggleView();});
    
    //If no unit was previously selected, default to MPH
    if ((this.persistance["View"] != "Manual") && (this.persistance["Unit"] != "Automatic")) this.persistance["View"] = "Automatic";
};

SimpleGears.prototype.toggleView = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance["View"] = this.persistance["View"] === 'Manual' ? 'Automatic' : 'Manual';
    this.save();
};

SimpleGears.prototype.update = function (streams) {
        
    //Get the values to work with, do rounding and stuff as needed TODO: Get if car is manual or automatic automatically when this is exposed to the ui system
	aGear = Math.round(streams["electrics"].gear_A*5);
    mGear = streams["engineInfo"][5];
    maxFGears = streams["engineInfo"][6];
    maxRGears = streams["engineInfo"][7];

    //start canvas stuff
    c = this.canvas[0];
	ctx = c.getContext('2d');
    
    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,100,75);
    
    if (this.persistance["View"] === "Manual"){
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
        ctx.font='35px "Dejavu Sans Mono", Monaco, monospace';
        ctx.textAlign="center";

        //Direction
        ctx.fillStyle = "RGBA(0,0,0,0.5)";
        ctx.fillText(gearDirStr,50,35);

        //Gear number
        ctx.font='18px "Dejavu Sans Mono", Monaco, monospace';
        ctx.fillText(gearNumStr,50,53);
    } else {
        
        gearNames = ["P","R","N","D","2","1"];
        
        //Setup Text
        ctx.font='35px "Dejavu Sans Mono", Monaco, monospace';
        

        //Direction
        ctx.fillStyle = "RGBA(0,0,0,0.5)";
        ctx.fillText(gearNames[aGear],50,45);
    }
    
    ctx.textAlign="center";
    ctx.font='10px "Dejavu Sans Mono", Monaco, monospace';
    ctx.fillStyle = "RGBA(0,0,0,1)";
    ctx.fillText("Gear (" + this.persistance["View"] + ")",50,65);
    
};