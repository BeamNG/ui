function SimpleAGears() {}

SimpleAGears.prototype.initialize = function () {
    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);

    this.canvas.width = 200;
    this.canvas.height = 33;

    this.loaded = false;
};

SimpleAGears.prototype.update = function (streams) {

    //Get the values to work with, do rounding and stuff as needed
    var aGear = Math.round(streams.electrics.gear_A*5);

    var gearNames = ["P","R","N","D","2","1"];

    //start canvas stuff
    var c = this.canvas[0];
    var ctx = c.getContext('2d');

    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,200,33);

    //Setup Text
    ctx.font='18px Arial';
    ctx.textAlign="center";

    // //deselected gears
    ctx.fillStyle = "RGBA(0,0,0,0.5)";
    for (var i=0; i<6; i++){
        ctx.fillText(gearNames[i],25+(i*30),22);
    }

    //remove stuff over current gear
    ctx.fillStyle = "RGBA(255,255,255,0.9)";
    ctx.fillRect((aGear*30)+15,-2,20,36);

    //add box around gear
    ctx.strokeRect((aGear*30)+15,-2,20,36);

    //add current gear back in selected colour
    ctx.fillStyle = "RGBA(0,0,255,0.5)";
    ctx.fillText(gearNames[aGear],(aGear*30)+25,22);
};
