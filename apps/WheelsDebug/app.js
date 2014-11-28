function WheelsDebug(){}

WheelsDebug.prototype.initialize = function(){
    if(this.persistance.Unit === undefined){
        this.persistance.Unit = "metric";
    }

    this.data = {
        "factor":{
            "metric": 3.6,
            "imperial": 2.2369
        },
        "unitname":{
            "metric": "km/h",
            "imperial": "mph"
        }
    };

    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
    this.canvas.width=220;

    var self = this;
    this.canvas.click(function(event) {self.toggleUnit();});
};

function sortedWheelIndices(wheelInfo){ // TODO: duplicated in WeightDistribution app
    function getWheelNames(wheelInfo){
        var names=[];
        for(var i in wheelInfo)
            names.push(wheelInfo[i][0]);
        return names;
    }
    function wheelNamesToIndices(wheelInfo, wheelNames){
        var indices=[];
        for(var i in wheelNames)
            for(var j in wheelInfo)
                if (wheelNames[i] == wheelInfo[j][0])
                    indices.push(j);
        return indices;
    }
    return wheelNamesToIndices(wheelInfo, getWheelNames(wheelInfo).sort()); // alphabetical sort suits our needs: FL < FR < RL < RR
}

WheelsDebug.prototype.update = function(streams){
    var value = streams.wheelInfo;
    if (this.sortedWheelIndices !== undefined)
        if (value.length != this.sortedWheelIndices.length)
            delete this.sortedWheelIndices //invalidate sorting cache
    if (this.sortedWheelIndices === undefined)
        this.sortedWheelIndices = sortedWheelIndices(value);
    var wheelCount = 0;
    /* value format:
    0  wd.name
    1  wd.radius
    2  wd.wheelDir
    3  w.angularVelocity
    4  w.lastTorque
    5  drivetrain.wheelInfo[wd.wheelID].lastSlip
    6  wd.lastTorqueMode
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
    for(var i in this.sortedWheelIndices) {
        wheelCount++;
        var w = value[this.sortedWheelIndices[i]];
        // then draw
        ctx.fillText(w[0], x, y);
        filledArc(ctx, x, y, r, 1, 1, '#444444');

        var wheelSpeed = w[3] * w[1] * w[2];
        ctx.fillText(Math.floor(wheelSpeed * this.data.factor[this.persistance.Unit]) + ' '+this.data.unitname[this.persistance.Unit]    , x, y + fontSize + 3);
        filledArc(ctx, x, y, r - 1, rs, wheelSpeed/33, 'rgba(0,0,255,0.5)'); // outer rubber speed

        filledArc(ctx, x, y, r - 1 - rs, rs, w[5]/10 , 'rgba(0,0,0,0.5)'); // absolute slip

        var torque = (w[4] * w[2]) / 10000;
        var col = 'rgba(255,0,0,0.5)'; // no brake input, net brake (probably engine braking)
        if (torque > 0)
            col = 'rgba(0,255,0,0.5)'; // no brake input, net acceleration (probably throttle)
        if(w[6] == 1) {
            col = 'rgba(255,0,0,0.5)'; // foot brake
        } else if(w[6] == 2) {
            col = 'rgba(255,255,0,0.5)'; // hand brake
        }
        filledArc(ctx, x, y, r - 1 - rs * 2, rs, torque, col); // net force


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

WheelsDebug.prototype.toggleUnit = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance.Unit = this.persistance.Unit === 'imperial' ? 'metric' : 'imperial';
    this.save();
};

WheelsDebug.prototype.onVehicleChange = function(vehicleDirectory){
    delete this.sortedWheelIndices //invalidate sorting cache
}
