function SimpleSpeedo(){}

function pad100(num) {
    var s = "000000" + num;
    return s.substr(s.length-3);
}

SimpleSpeedo.prototype.initialize = function(){
	this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
        
	this.canvas.width = 200;
	this.canvas.height = 65;

    this.loaded = false;
    
    var self = this;
    this.rootElement.click(function(){self.toggleUnit();});
    
    //If no unit was previously selected, default to km/h
    if ((this.persistance["Unit"] != "MPH") && (this.persistance["Unit"] != "km/h")) this.persistance["Unit"] = "km/h";
};

SimpleSpeedo.prototype.toggleUnit = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance["Unit"] = this.persistance["Unit"] === 'MPH' ? 'km/h' : 'MPH';
    this.save();
};


SimpleSpeedo.prototype.update = function(streams){
        
    //Get the values to work with, do rounding and stuff as needed
    speedMs = streams["electrics"].wheelspeed;
    if (isNaN(speedMs)) speedMs = streams["electrics"].airspeed;    //If no wheelspeedo present use airspeed
    
    //Modify with selected units
    if(this.persistance["Unit"] == "MPH"){
        speedUnits = toInt(2.236*speedMs);
    } else {
        speedUnits = toInt(3.6*speedMs);
    }
    
    //for resetting scale >160
    if (speedUnits > 160) {
        speedStart = 160;
    } else {
        speedStart = 0;
    }
    
    //start canvas stuff
    c = this.canvas[0];
	ctx = c.getContext('2d');
        
    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,200,65);
        
    //Make the bar
    if (speedStart == 0){
        ctx.fillStyle = "RGBA(0,0,128,0.5)";
    } else {
        ctx.fillStyle = "RGBA(128,0,128,0.5)";
    }
    
    ctx.fillRect(20,10,Math.min(speedUnits-speedStart, 160),25);
    
    //text
    ctx.font='20px "Dejavu Sans Mono", Monaco, monospace';
    ctx.textAlign="center";
    
    ctx.fillStyle = "black";
    ctx.fillText(pad100(speedUnits),100,30);
    
    //add border
    ctx.strokeRect(20,10,160,25);    
    
    //Add labels
    //-Units
    ctx.font='10px "Dejavu Sans Mono", Monaco, monospace';
    ctx.fillText(this.persistance["Unit"],100,58);
    
    //-Numbers
    ctx.font='7px "Dejavu Sans Mono", Monaco, monospace';
    var interval = 20;
    for (var x=0; x<=160; x+=interval) {
        ctx.fillText(speedStart+x,x+20,48);
    }
    
    //Add Graduations
    //20px/20unit intervals
    for (var x=20; x<=180; x+=interval) {
        ctx.beginPath();
        ctx.moveTo(x, 35);
        ctx.lineTo(x, 40);
        ctx.stroke();   
    }
    //and 10px/10unit intervals
    for (var x=30; x<=180; x+=interval) {
        ctx.beginPath();
        ctx.moveTo(x, 35);
        ctx.lineTo(x, 38);
        ctx.stroke();   
    }
};
