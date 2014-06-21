function SimpleAngles() {}

SimpleAngles.prototype.initialize = function () {
    this.mainDiv = $('<div></div>').appendTo(this.rootElement).addClass('mainDiv');
    this.canvas = $('<canvas width=360 height=200></canvas>').appendTo(this.mainDiv).addClass('canvas');

    this.canvas.width = 360;
    this.canvas.height = 200;

    this.labelDiv = $('<div></div>').appendTo(this.rootElement).addClass('labelDiv');




    this.pitchReadout = new Image();
    this.pitchReadout.onload = function() {
        // console.log("loaded");
    };
    this.pitchReadout.src = this.path + 'pitch_readout.svg';

    this.rollReadout = new Image();
    this.rollReadout.onload = function() {
        // console.log("loaded");
    };
    this.rollReadout.src = this.path + 'roll_readout.svg';

    this.pitchBackground = new Image();
    this.pitchBackground.onload = function() {
        // console.log("loaded");
    };
    this.pitchBackground.src = this.path + 'pitch_background.svg';

    this.rollBackground = new Image();
    this.rollBackground.onload = function() {
        // console.log("loaded");
    };
    this.rollBackground.src = this.path + 'roll_background.svg';
};

SimpleAngles.prototype.update = function (streams) {

    var c = this.canvas[0];
    var ctx = c.getContext('2d');

    ctx.lineWidth = 5;
    ctx.strokeStyle = "RGBA(255,0,0,0.5)";

    ctx.clearRect(0,0,400,200);

    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate(Math.asin(streams.sensors.pitch));
    ctx.translate(-100, -100);
    ctx.drawImage(this.pitchBackground, 0, 0, 200, 200);
    ctx.restore();

    ctx.save();
    ctx.translate(260, 100);
    ctx.rotate(Math.asin(-streams.sensors.roll));
    ctx.translate(-260, -100);
    ctx.drawImage(this.rollBackground, 160, 0, 200, 200);
    ctx.restore();

    ctx.drawImage(this.pitchReadout, 0, 0, 200, 200);
    ctx.drawImage(this.rollReadout, 160, 0, 200, 200);


    ctx.stroke();

    this.labelDiv.html("Pitch: "+(Math.asin(streams.sensors.pitch)/Math.PI*180).toFixed(1) +" | Roll: " +(Math.asin(streams.sensors.roll)/Math.PI*180).toFixed(1));

    // this.mainDiv.html(pitch);
};
