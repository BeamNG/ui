function SimpleGears() {}

SimpleGears.prototype.initialize = function () {

    this.bigGearDiv = $('<div></div>').appendTo(this.rootElement).addClass('bigGearDiv');
    this.ltlGearDiv = $('<div></div>').appendTo(this.rootElement).addClass('ltlGearDiv');
    this.labelDiv = $('<div></div>').appendTo(this.rootElement).addClass('labelDiv');

    this.loaded = false;

    var self = this;
    this.labelDiv.click(function(){self.toggleView();});

    //If no unit was previously selected, default to Auto
    if ((this.persistance.View != "Manual") && (this.persistance.View != "Auto")) this.persistance.View = "Auto";
};

SimpleGears.prototype.toggleView = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance.View = this.persistance.View === 'Manual' ? 'Auto' : 'Manual';
    this.save();
};

SimpleGears.prototype.update = function (streams) {

    //Get the values to work with, do rounding and stuff as needed TODO: Get if car is manual or Auto Autoally when this is exposed to the ui system
    var aGear = Math.round(streams.electrics.gear_A*5);
    var mGear = streams.engineInfo[5];
    var maxFGears = streams.engineInfo[6];
    var maxRGears = streams.engineInfo[7];

    var gearNames = ["P","R","N","D","2","1"];

    if (this.persistance.View === "Manual"){

        //get the sign of the current manual gear
        var sign = mGear?mGear<0?-1:1:0;

        //get the direction
        var gearDirStr;
        if (sign == -1) {
            gearDirStr = "R";
        } else if (sign == 1) {
            gearDirStr = "F";
        } else {
            gearDirStr = "N";
        }

        var gearNumStr;
        //get the gear number
        if (mGear > 0) {
            gearNumStr = Math.abs(mGear) + "/" + maxFGears;
            this.bigGearDiv.html(gearNumStr);
            this.ltlGearDiv.html(gearDirStr);
        } else if (mGear < 0 && maxRGears > 1) {
            gearNumStr = Math.abs(mGear) + "/" + maxRGears;
            this.bigGearDiv.html(gearNumStr);
            this.ltlGearDiv.html(gearDirStr);
        } else {
            gearNumStr = "";
            this.bigGearDiv.html(gearDirStr);
            this.ltlGearDiv.html(gearNumStr);
        }

    } else {
        //we are in auto, display Auto gear name
        this.bigGearDiv.html(gearNames[aGear]);
        this.ltlGearDiv.html("");
    }

    this.labelDiv.html("Gears (" + this.persistance.View + ")");
};
