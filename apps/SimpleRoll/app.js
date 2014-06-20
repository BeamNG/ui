function SimpleRoll() {}

SimpleRoll.prototype.initialize = function () {
    this.canvas = $('<canvas width="512" height="512"></canvas>').appendTo(this.rootElement).addClass('canvas');

    var self = this;
    this.canvas.click(function(){self.toggledisplaySide();});

    //If no unit was previously selected, default to km/h
    if ((this.persistance.displaySide != "left") && (this.persistance.displaySide != "right")) this.persistance.displaySide = "left";

    this.pitchIco = new Image();
    this.pitchIco.onload = function() {
        // console.log("loaded");
    };
    this.pitchIco.src = this.path + 'rollIco.svg';
};

SimpleRoll.prototype.toggledisplaySide = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance.displaySide = this.persistance.displaySide === 'left' ? 'right' : 'left';
    this.save();
};

SimpleRoll.prototype.update = function (streams) {

    var roll = Math.asin(-streams.sensors.roll);

    var c = this.canvas[0];
    var ctx = c.getContext('2d');

    ctx.clearRect(0, 0, 512, 512);

    //Rotating Background
    ctx.clearRect(0, 0, 512, 512);

    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(roll);
    ctx.translate(-256, -256);

    // Bottom Semi
    ctx.fillStyle = "RGBA(128,0,0,0.5)";
    ctx.beginPath();
    ctx.arc(256, 256, 175, 0, Math.PI);
    ctx.fill();

    // Top Semi
    ctx.beginPath();
    ctx.fillStyle = "RGBA(0,0,128,0.5)";
    ctx.arc(256, 256, 175, Math.PI, 0);
    ctx.fill();

    //Dividing line
    ctx.beginPath();
    ctx.moveTo(81, 256);
    ctx.lineTo(431, 256);
    ctx.lineWidth = 5;
    ctx.stroke();

    // Icon thing
    ctx.translate(128, 128);
    ctx.drawImage(this.pitchIco, 0, 0, 256, 256);
    ctx.restore();

    ctx.restore();

    //Label
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((roll / Math.PI * 180).toFixed(1) + "\u00B0", 256, 480);

    ctx.fillText("Roll", 256, 32);

    // Main ring circle
    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(256, 256, 175, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();

    // graduations
    if (this.persistance.displaySide === 'right'){
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        for (var i = -60; i <= 60; i = i + 20) {
            ctx.save();
            ctx.translate(256, 256);
            ctx.rotate(i * Math.PI / 180);
            ctx.translate(-256, -256);

            ctx.moveTo(431, 256);
            ctx.lineTo(384, 256);

            ctx.fillText(Math.abs(i), 452, 256);

            ctx.restore();
        }
    } else {
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        for (var i = -60; i <= 60; i = i + 20) {
            ctx.save();
            ctx.translate(256, 256);
            ctx.rotate(i * Math.PI / 180);
            ctx.translate(-256, -256);

            ctx.moveTo(81, 256);
            ctx.lineTo(125, 256);

            ctx.fillText(Math.abs(i), 60, 256);

            ctx.restore();
        }
    }

    ctx.stroke();
};

SimpleRoll.prototype.resize = function(){
        var size = Math.min(this.rootElement.height(),this.rootElement.width());
        $( this.canvas ).css( {
            height : size,
            width: size
        });
};
