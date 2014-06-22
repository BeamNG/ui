function gForcesDebug(){}

gForcesDebug.prototype.initialize = function(){
    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
    this.textElement = $('<div></div>').appendTo(this.rootElement);

    this.resize();
};

gForcesDebug.prototype.update = function(streams){
    //convert to G
    var gForces = {};
    $.each(streams.sensors, function(index, val) {
        gForces[index] = val / 9.81;
    });

    var c = this.canvas[0];
    var ctx = c.getContext('2d');
    ctx.font = '16px "Lucida Console", Monaco, monospace';
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    ctx.clearRect(-100,-100,200,200);

    // Circles
	ctx.fillStyle = "RGBA(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(0,0,50*2,0,2*Math.PI,false);
    ctx.fill();

    ctx.fillStyle = "RGBA(128,128,128,0.2)";
    for (var i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0,0,50*i,0,2*Math.PI,false);
        ctx.fill();
    }

    // Min/Max-g's
    ctx.strokeStyle = "RGBA(0,0,255,0.7)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(gForces.gxMin*50,0);
    ctx.lineTo(gForces.gxMax*50,0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,gForces.gyMin*-50);
    ctx.lineTo(0,gForces.gyMax*-50);
    ctx.stroke();


    // Labels
    ctx.fillStyle = "black";
    for (var i = 1; i < 3; i++) {
        ctx.fillText(i+"g",50*i-5,0);
    }

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(gForces.gx*50,gForces.gy*-50,5,0,2*Math.PI,false);
    ctx.fill();

    ctx.fillStyle = "green";

    ctx.beginPath();
    ctx.arc(gForces.gx2*50,gForces.gy2*-50,5,0,2*Math.PI,false);
    ctx.fill();

//    this.textElement.html(htmlstr);
};

gForcesDebug.prototype.resize = function(){
    var size = Math.min(this.rootElement.height(),this.rootElement.width());
    this.canvas.height(size);
    this.canvas.width(size);

    var c = this.canvas[0];
    c.width = size;
    c.height = size;

    var ctx = c.getContext('2d');
    ctx.setTransform(c.width/200, 0, 0, c.height/200, c.width/2,c.height/2);
};
