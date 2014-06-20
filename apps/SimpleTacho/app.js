function SimpleTacho(){}

SimpleTacho.prototype.initialize = function(){
    this.canvas = $('<canvas height="53px"></canvas>').appendTo(this.rootElement).addClass('canvas');

    this.labelDiv = $('<div></div>').appendTo(this.rootElement).addClass('labelDiv');

    this.canvas.width = 200;
    this.canvas.height = 53;

    this.loaded = false;
};

SimpleTacho.prototype.update = function(streams){

    //Get the values to work with, do rounding and stuff as needed
    var rpm = toInt(streams.engineInfo[4]);
    var rpmMax = streams.engineInfo[1];
    var rpmIdle = streams.engineInfo[0];

    //start canvas stuff
    var c = this.canvas[0];
    var ctx = c.getContext('2d');

    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,200,65);

    //work out what colour do do bar in TODO: Cleaner way of doing this?
    var rgba='RGBA';

    if(rpm < rpmIdle*1.25) {        //we are at idle, blue
        rgba+='(0,0,255,0.5)';
    } else if(rpm > rpmMax*0.9) {   //we are near redline, red
        rgba+='(255,0,0,0.5)';
    } else {                        //normal rpm, green
        rgba+='(0,255,0,0.5)';
    }

    ctx.fillStyle = rgba;

    //Make the bar
    ctx.fillRect(20,10,rpm/(rpmMax/160),25);

    //setup text
    ctx.font='20px Arial';
    ctx.textAlign="center";

    //Add RPM value to bar
    ctx.fillStyle = "black";
    ctx.fillText(rSet(rpm, 4, "0"),100,30);

    //add border
    ctx.strokeRect(20,10,160,25);

    //Add min/max values, label
    ctx.font='10px Arial';
    ctx.fillText("0000",20,48);
    ctx.fillText(rpmMax,180,48);

    //Units
    this.labelDiv.html("Engine RPM");
};
