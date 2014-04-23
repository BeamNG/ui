function SimpleDigTacho() {}

function pad1k(num) {
    var s = "0000" + num;
    return s.substr(s.length-4);
}

SimpleDigTacho.prototype.initialize = function () {
    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
    
    this.canvas.width = 100;
    this.canvas.height = 75;

    this.loaded = false;
    
};

SimpleDigTacho.prototype.update = function (streams) {
        
    //Get the values to work with, do rounding and stuff as needed TODO: Get if car is manual or automatic automatically when this is exposed to the ui system
	rpm = toInt(streams["engineInfo"][4]);

    //start canvas stuff
    c = this.canvas[0];
	ctx = c.getContext('2d');
    
    //clear before drawing stuff on canvas
    ctx.clearRect(0,0,100,75);

    //Setup Text
    ctx.font='35px "Lucida Console", Monaco, monospace';
    ctx.textAlign="center";

    //display RPM
    ctx.fillStyle = "RGBA(0,0,0,0.5)";
    ctx.fillText(pad1k(rpm),50,45);
    
    //Label
    ctx.font='10px "Lucida Console", Monaco, monospace';
    ctx.fillStyle = "RGBA(0,0,0,1)";
    ctx.fillText("RPM",50,65);
};