function SimpleGears() {}

SimpleGears.prototype.initialize = function () {
    
    this.gearsField = $('<div></div>').appendTo(this.rootElement).addClass('gearsField');
    this.gearnoField = $('<div></div>').appendTo(this.rootElement).addClass('gearnoField');
    this.unitField = $('<div></div>').appendTo(this.rootElement).addClass('unitField');

    this.loaded = false;
    
    var self = this;
    this.unitField.click(function(){self.toggleView();});
    
    //If no unit was previously selected, default to Auto
    if ((this.persistance["View"] != "Manual") && (this.persistance["Unit"] != "Auto")) this.persistance["View"] = "Auto";
};

SimpleGears.prototype.toggleView = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance["View"] = this.persistance["View"] === 'Manual' ? 'Auto' : 'Manual';
    this.save();
};

SimpleGears.prototype.update = function (streams) {
        
    //Get the values to work with, do rounding and stuff as needed TODO: Get if car is manual or Auto Autoally when this is exposed to the ui system
	aGear = Math.round(streams["electrics"].gear_A*5);
    mGear = streams["engineInfo"][5];
    maxFGears = streams["engineInfo"][6];
    maxRGears = streams["engineInfo"][7];
    
    gearNames = ["P","R","N","D","2","1"];
    
    if (this.persistance["View"] === "Manual"){
        
        //get the sign of the current manual gear
        sign = mGear?mGear<0?-1:1:0
        
        //get the direction
        if (sign == -1) {
        gearDirStr = "R"
        } else if (sign == 1) {
        gearDirStr = "F"
        } else {
        gearDirStr = "N"
        }
        
        //get the gear number
        if (mGear > 0) {
        gearNumStr = Math.abs(mGear) + "/" + maxFGears;
        } else if (mGear < 0 && maxRGears > 1) {
        gearNumStr = Math.abs(mGear) + "/" + maxRGears;
        } else {
        gearNumStr = "";
        }
        
        //add to html
        this.gearsField.html(gearDirStr);
        this.gearnoField.html(gearNumStr);
        
    } else {
        //we are in auto, display Auto gear name
        this.gearsField.html(gearNames[aGear]);
        this.gearnoField.html("");
    }
    
    this.unitField.html("Gears (" + this.persistance["View"] + ")")
};
