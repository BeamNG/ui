function SimpleRPMDebug(){}

SimpleRPMDebug.prototype.initialize = function(){
    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);

    this.resize();

    this.loaded = false;
};

SimpleRPMDebug.prototype.update = function(streams){

    //Get the values to work with, do rounding and stuff as needed
    var idleRPM = streams.engineInfo[0];
    var maxRPM = streams.engineInfo[1];
    var shiftUpRPM = streams.engineInfo[2];
    var shiftDnRPM = streams.engineInfo[3];
    var curRPM = streams.engineInfo[4];

    //start canvas stuff
    var c = this.canvas[0];
    var ctx = c.getContext('2d');

    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,this.canvas.width*2,this.canvas.height*2);

    //background circle
    ctx.arc(this.canvas.width/2,this.canvas.height/2,this.canvas.height*0.5,0,2*Math.PI);
    ctx.fillStyle = "RGBA(255,255,255,0.9)";
    ctx.fill();

    //currentRPM
    ctx.beginPath();
    ctx.arc(this.canvas.width/2,this.canvas.height/2,this.canvas.height*0.4,0.5*Math.PI,0.5*Math.PI+curRPM/maxRPM*2*Math.PI);
    ctx.lineWidth = Math.min(this.rootElement.height(),this.rootElement.width())/10;
    ctx.strokeStyle = "RGBA(128,128,128,0.75)";
    ctx.stroke();

    //idle RPM
    ctx.beginPath();
    ctx.moveTo(this.canvas.width/2,this.canvas.height/2);
    ctx.arc(this.canvas.width/2,this.canvas.height/2,this.canvas.height*0.4,0.5*Math.PI,0.5*Math.PI+idleRPM/maxRPM*2*Math.PI);
    ctx.lineTo(this.canvas.width/2,this.canvas.height/2);
    ctx.fillStyle = "RGBA(0,0,0,0.5)";
    ctx.fill();

    //shift dn RPM
    ctx.beginPath();
    ctx.moveTo(this.canvas.width/2,this.canvas.height/2);
    ctx.arc(this.canvas.width/2,this.canvas.height/2,this.canvas.height*0.4,0.5*Math.PI+idleRPM/maxRPM*2*Math.PI,0.5*Math.PI+shiftDnRPM/maxRPM*2*Math.PI);
    ctx.lineTo(this.canvas.width/2,this.canvas.height/2);
    ctx.fillStyle = "RGBA(0,0,255,0.5)";
    ctx.fill();

    //shift up RPM
    ctx.beginPath();
    ctx.moveTo(this.canvas.width/2,this.canvas.height/2);
    ctx.arc(this.canvas.width/2,this.canvas.height/2,this.canvas.height*0.4,0.5*Math.PI+shiftDnRPM/maxRPM*2*Math.PI,0.5*Math.PI+shiftUpRPM/maxRPM*2*Math.PI);
    ctx.lineTo(this.canvas.width/2,this.canvas.height/2);
    ctx.fillStyle = "RGBA(255,0,255,0.5)";
    ctx.fill();

    //max RPM
    ctx.beginPath();
    ctx.moveTo(this.canvas.width/2,this.canvas.height/2);
    ctx.arc(this.canvas.width/2,this.canvas.height/2,this.canvas.height*0.4,0.5*Math.PI+shiftUpRPM/maxRPM*2*Math.PI,0.5*Math.PI+maxRPM/maxRPM*2*Math.PI);
    ctx.lineTo(this.canvas.width/2,this.canvas.height/2);
    ctx.fillStyle = "RGBA(255,0,0,0.5)";
    ctx.fill();
};

SimpleRPMDebug.prototype.resize = function(){
    var size = Math.min(this.rootElement.height(),this.rootElement.width());
    this.canvas.height = size;
    this.canvas.width = size;

    var c = this.canvas[0];
    c.width = size;
    c.height = size;
};
