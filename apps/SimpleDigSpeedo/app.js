function SimpleDigSpeedo() {}

SimpleDigSpeedo.prototype.initialize = function () {
    this.speedDiv = $('<div></div>').appendTo(this.rootElement).addClass('speedDiv');
    this.labelDiv = $('<div></div>').appendTo(this.rootElement).addClass('labelDiv');

    this.loaded = false;

    var self = this;
    this.labelDiv.click(function(){self.toggleUnits();});

    //If no unit was previously selected, default to km/h
    if ((this.persistance.Unit != "MPH") && (this.persistance.Unit != "km/h")) this.persistance.Unit = "km/h";
};

SimpleDigSpeedo.prototype.toggleUnits = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance.Unit = this.persistance.Unit === 'MPH' ? 'km/h' : 'MPH';
    this.save();
};

SimpleDigSpeedo.prototype.update = function (streams) {

    var speedMs = streams.electrics.wheelspeed;
    if (isNaN(speedMs)) speedMs = streams.electrics.airspeed;    //If no wheelspeedo present use airspeed

    var speedUnits;
    if(this.persistance.Unit == "MPH"){
        speedUnits = toInt(2.236*speedMs);
    } else {
        speedUnits = toInt(3.6*speedMs);
    }

    this.speedDiv.html(rSet(speedUnits, 4, "0"));
    this.labelDiv.html("Speed (" + this.persistance.Unit + ")");
};
