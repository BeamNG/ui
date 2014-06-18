function SimplePedals(){}

SimplePedals.prototype.initialize = function(){
    this.canvas = $('<canvas height="53px"></canvas>').appendTo(this.rootElement).addClass("canvas");

    this.labelDiv = $('<div></div>').appendTo(this.rootElement).addClass('labelDiv');

    this.canvas.width = 100;
    this.canvas.height = 53;

    this.loaded = false;
};

SimplePedals.prototype.update = function(streams){

    //Get the values to work with, do rounding and stuff as needed
    var throttleVal = toInt(streams.electrics.throttle * 100);
    var brakeVal = toInt(streams.electrics.brake * 100);
    var clutchVal = Math.round(streams.electrics.clutch * 100 + 0.49);
    var parkingVal = toInt(streams.electrics.parkingbrake * 100);

    //start canvas stuff
    var c = this.canvas[0];
    var ctx  = c.getContext('2d');

    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,100,53);

    //clutch
    ctx.fillStyle = "RGBA(0,0,255,0.5)";
    ctx.fillRect(14,45,15,-clutchVal*0.4);

    //brake
    ctx.fillStyle = "RGBA(255,0,0,0.5)";
    ctx.fillRect(33,45,15,-brakeVal*0.4);

    //throttle
    ctx.fillStyle = "RGBA(0,255,0,0.5)";
    ctx.fillRect(52,45,15,-throttleVal*0.4);

    //pbrake
    ctx.fillStyle = "RGBA(255,255,0,0.5)";
    ctx.fillRect(71,45,15,-parkingVal*0.4);


    //addtext
    ctx.font='7px Arial';
    ctx.textAlign="center";

    ctx.fillStyle = "black";
    ctx.fillText(clutchVal,     21.5,52);
    ctx.fillText(brakeVal,      40.5,52);
    ctx.fillText(throttleVal,   59.5,52);
    ctx.fillText(parkingVal,    78.5,52);

    //add borders
    ctx.strokeStyle = "black";
    ctx.strokeRect(52,45,15,-40);
    ctx.strokeRect(33,45,15,-40);
    ctx.strokeRect(14,45,15,-40);
    ctx.strokeRect(71,45,15,-40);

    //Add label
    this.labelDiv.html("Pedals & Axis");
};
