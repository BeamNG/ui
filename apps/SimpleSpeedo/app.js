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
    
    self = this;
    this.rootElement.click(function(){self.toggleUnit();});
    
    if (isNaN(this.persistance["Unit"])) this.persistance["Unit"] = "MPH";
};

SimpleSpeedo.prototype.toggleUnit = function(){
        this.persistance["Unit"] = this.persistance["Unit"] === 'MPH' ? 'KM/H' : 'MPH';
        this.save();
};


SimpleSpeedo.prototype.update = function(streams){
        
    //Get the values to work with, do rounding and stuff as needed
    SpeedMs = streams["electrics"].wheelspeed;
    if (isNaN(SpeedMs)) SpeedMs = streams["electrics"].airspeed;
    
    if(this.persistance["Unit"] == "MPH"){
        speedUnits = Math.round(2.236*SpeedMs);
    } else {
        speedUnits = Math.round(3.6*SpeedMs);
    }
    
    
    //start canvas stuff
    c = this.canvas[0];
	ctx = c.getContext('2d');
        
    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,200,65);
    
    //background rectangle
    ctx.fillStyle = "RGBA(255,255,255,0.75)";
    ctx.fillRect(0,0,200,65);
        
    //Make the bar
    ctx.fillStyle = "RGBA(0,0,128,0.5)";
    ctx.fillRect(20,10,Math.min(speedUnits, 160),25);
    
    //text
    ctx.font='20px "Lucida Console", Monaco, monospace';
    ctx.textAlign="center";
    
    ctx.fillStyle = "black";
    ctx.fillText(pad100(speedUnits),100,30);
    
    //add border
    ctx.strokeRect(20,10,160,25);    
    
    //label some stuff
    ctx.font='10px "Lucida Console", Monaco, monospace';
    ctx.fillText("0",20,48);
    ctx.fillText("160",180,48);

    ctx.fillText(this.persistance["Unit"],100,58);
    
    ctx.font='7px "Lucida Console", Monaco, monospace';
    ctx.fillText("20",40,48);
    ctx.fillText("40",60,48);
    ctx.fillText("60",80,48);
    ctx.fillText("80",100,48);
    ctx.fillText("100",120,48);
    ctx.fillText("120",140,48);
    ctx.fillText("140",160,48);
    
    //some graduations
    //20mph intervals
    ctx.beginPath();
    ctx.moveTo(20, 35);
    ctx.lineTo(20, 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(40, 35);
    ctx.lineTo(40, 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(60, 35);
    ctx.lineTo(60, 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(80, 35);
    ctx.lineTo(80, 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(100, 35);
    ctx.lineTo(100, 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(120, 35);
    ctx.lineTo(120, 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(140, 35);
    ctx.lineTo(140, 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(160, 35);
    ctx.lineTo(160, 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(180, 35);
    ctx.lineTo(180, 40);
    ctx.stroke();
    
    //10mph
    ctx.beginPath();
    ctx.moveTo(30, 35);
    ctx.lineTo(30, 38);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(50, 35);
    ctx.lineTo(50, 38);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(70, 35);
    ctx.lineTo(70, 38);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(90, 35);
    ctx.lineTo(90, 38);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(110, 35);
    ctx.lineTo(110, 38);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(130, 35);
    ctx.lineTo(130, 38);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(150, 35);
    ctx.lineTo(150, 38);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(170, 35);
    ctx.lineTo(170, 38);
    ctx.stroke();
};