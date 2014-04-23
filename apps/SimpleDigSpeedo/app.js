function SimpleDigSpeedo() {}

function pad1k(num) {
    var s = "----" + num;
    return s.substr(s.length-4);
}

SimpleDigSpeedo.prototype.initialize = function () {
    this.speedField = $('<div></div>').appendTo(this.rootElement).addClass('speedField');
    this.unitField = $('<div></div>').appendTo(this.rootElement).addClass('unitField');

    this.loaded = false;
    
    var self = this;
    this.unitField.click(function(){self.toggleUnits();});
    
    //If no unit was previously selected, default to km/h
    if ((this.persistance["Unit"] != "MPH") && (this.persistance["Unit"] != "km/h")) this.persistance["Unit"] = "km/h";
};

SimpleDigSpeedo.prototype.toggleUnits = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance["Unit"] = this.persistance["Unit"] === 'MPH' ? 'km/h' : 'MPH';
    this.save();
};

SimpleDigSpeedo.prototype.update = function (streams) {
        
    speedMs = streams["electrics"].wheelspeed;
    if (isNaN(speedMs)) speedMs = streams["electrics"].airspeed;    //If no wheelspeedo present use airspeed
    
    if(this.persistance["Unit"] == "MPH"){
        speedUnits = toInt(2.236*speedMs);
    } else {
        speedUnits = toInt(3.6*speedMs);
    }
    
    this.speedField.html(pad1k(speedUnits));
    
    this.unitField.html(this.persistance["Unit"]);
};