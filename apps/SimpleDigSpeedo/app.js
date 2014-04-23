function SimpleDigSpeedo() {}

function padk(num) {
    var s = "000000" + num;
    return s.substr(s.length-4);
}

SimpleDigSpeedo.prototype.initialize = function () {
    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
    
    this.canvas.width = 100;
    this.canvas.height = 75;

    this.loaded = false;
    
    var self = this;
    this.rootElement.click(function(){self.toggleUnits();});
    
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

    //start canvas stuff
    c = this.canvas[0];
	ctx = c.getContext('2d') ;
    
    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,100,75);
    
    //Setup Text
    ctx.font='35px "Lucida Console", Monaco, monospace';
    ctx.textAlign="center";

    //display RPM
    ctx.fillStyle = "RGBA(0,0,0,0.5)";
    ctx.fillText(pad1k(speedUnits),50,45);
    
    //Label
    ctx.font='10px "Lucida Console", Monaco, monospace';
    ctx.fillStyle = "RGBA(0,0,0,1)";
    ctx.fillText(this.persistance["Unit"],50,65);
    
};