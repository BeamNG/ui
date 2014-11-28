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

function sortedWheelIndices(wheelInfo){ // TODO: duplicated in WheelsDebug app
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

WeightDistribution.prototype.update = function(streams){
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
    var totalDownForce = 0;
    var nwheels = this.sortedWheelIndices.length;

    for(var j in value) {
        totalDownForce += value[j][7];
    }

    for(var i in this.sortedWheelIndices) {
        wheelCount++;
        var w = value[this.sortedWheelIndices[i]];
        var downForce = w[7];
        // then draw

        if ((downForce/totalDownForce)*nwheels < 1)
            filledArc(ctx, x, y, r/2, 1, 1, "#aaa"); // regular weight distribution marker

        var gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, 'RGBA(0,255,0,0.5)');
        gradient.addColorStop(0.4, 'RGBA(0,255,0,0.5)');
        gradient.addColorStop(0.6, 'RGBA(255,0,0,0.5)');
        gradient.addColorStop(1, 'RGBA(255,0,0,0.5)');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.arc(x, y, (downForce/totalDownForce)*nwheels*(r/2), 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#000';

        ctx.fillText(w[0], x, y - ((fontSize + 0)/2));
        ctx.fillText(Math.round((downForce/totalDownForce)*100 ) + ' %', x, y + ((fontSize + 0)/1));
        filledArc(ctx, x, y, r, 1, 1, '#444'); // max circle size marker (currently double the regular weight distribution)

        ctx.fillText(Math.round((downForce / 9.81) *this.data.factor[this.persistance.Unit]) + ' ' + this.data.unitname[this.persistance.Unit]    , x, y - r + (fontSize*2));
        ctx.fillText(Math.round(downForce ) + ' N', x, y + r - (fontSize*1));

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

WeightDistribution.prototype.onVehicleChange = function(vehicleDirectory){
    delete this.sortedWheelIndices //invalidate sorting cache
}
