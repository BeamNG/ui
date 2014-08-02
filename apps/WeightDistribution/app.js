function WeightDistribution(){}

WeightDistribution.prototype.initialize = function(){
    if(this.persistance.Unit === undefined){
        this.persistance.Unit = "metric";
    }

    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
    this.canvas.width=220;

        this.data = {
        "factor":{
            "metric": 1,
            "imperial": 2.2
        },
        "unitname":{
            "metric": "kg",
            "imperial": "lbs"
        }
    };

    var self = this;
    this.canvas.click(function(event) {self.toggleUnit();});
};

WeightDistribution.prototype.update = function(streams){
    var value = streams.wheelInfo;
    var wheelCount = 0;
    /* value format:
    0  wd.name
    1  wd.radius
    2  wd.wheelDir
    3  w.angularVelocity
    4  w.lastTorque
    5  drivetrain.wheelInfo[wd.wheelID].lastSlip
    6  wd.lastTorqueMode
    7  drivetrain.wheelInfo[wd.wheelID].downForce
    */
    var c = $(this.canvas)[0];
    var ctx = c.getContext('2d');

    // clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.textAlign = 'center';
    var fontSize = 11;
    ctx.font = fontSize + 'pt "Lucida Console", Monaco, monospace';
    var r = 50;
    var rs = 5;
    var b = 5;
    var x = r + b;
    var y = r + b;
    var max = 0;

    for(var j in value) {
        max += value[j][7];
    }

    for(var i in value) {
        wheelCount++;
        var w = value[i];
        var downForce = w[7];
        // then draw


        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.arc(x,y,(downForce/max)*r,0,Math.PI*2,0);
        ctx.fill();

        ctx.fillStyle = '#000';

        ctx.fillText(w[0], x, y - (fontSize + 3));
        filledArc(ctx, x, y, r, 1, 1, '#444444');

        ctx.fillText(Math.round((downForce / 9.81) *this.data.factor[this.persistance.Unit]) + ' ' + this.data.unitname[this.persistance.Unit]    , x, y );
        ctx.fillText(Math.round(downForce ) + ' N', x, y + (fontSize + 3));
        ctx.fillText(Math.round((downForce/max)*100 ) + ' %', x, y + 2 * (fontSize + 3));


        x += 2 * r +  5;

        if(x + r >= c.width) {
            x = r + b;
            y += 2 * r + 5;
        }
    }
    //Calculating height:
    var wheelRows = Math.ceil(wheelCount/2);
    var height =  wheelRows * ( 2 * r  + 5);
    if(c.height != height)
    {
        c.height = height;
    }

};

WeightDistribution.prototype.toggleUnit = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance.Unit = this.persistance.Unit === 'imperial' ? 'metric' : 'imperial';
    this.save();
};
