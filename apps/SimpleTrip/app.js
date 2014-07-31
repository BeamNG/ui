function SimpleTrip() {}

SimpleTrip.prototype.initialize = function () {
    this.dataDiv = $('<div></div>').appendTo(this.rootElement).addClass('dataDiv');
    this.unitDiv = $('<div></div>').appendTo(this.rootElement).addClass('unitDiv');
    this.labelDiv = $('<div></div>').appendTo(this.rootElement).addClass('labelDiv');

    this.loaded = false;

    var self = this;
    this.labelDiv.click(function(){self.toggleMode();});

    this.unitDiv.click(function(){self.toggleUnits();});

    //If no unit was previously selected, default to Metric
    if ((this.persistance.Unit != "Imperial") && (this.persistance.Unit != "Metric")) this.persistance.Unit = "Metric";

    /* Initialize mode.
    0 = distance
    1 = avg speed
    2 = avg mpg
    3 = current mpg
    4 = range
    */

    if (isNaN(this.persistance.mode)) this.persistance.mode = 0;

    this.timer    = 0;
    this.prevTime = 0;
    this.curTime  = 0;

    this.count         = 0;
    this.totalDistance = 0;
    this.avgSpeed      = 0;
    this.range         = 0;

    this.fuelConsumptionRate      = 0;
    this.avgFuelConsumptionRate   = 0;
    this.previousFuel             = 0;
};

SimpleTrip.prototype.toggleMode = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance.mode++;
    if(this.persistance.mode > 4) this.persistance.mode = 0;
    this.save();
};

SimpleTrip.prototype.toggleUnits = function(){
    //Toggle between Imperial and Metric, save the option to persistance system
    this.persistance.Unit = this.persistance.Unit === 'Imperial' ? 'Metric' : 'Imperial';
    this.save();
};

SimpleTrip.prototype.update = function (streams) {

    var wheelspeed = streams.electrics.wheelspeed;

    this.prevTime = this.curTime;
    this.curTime  = performance.now();
    var dt = (this.curTime - this.prevTime)/1000;

    this.timer -= dt;
    if(this.timer < 0) {
        this.totalDistance += ((1 - this.timer) * wheelspeed);

        this.count++;

        this.avgSpeed += (wheelspeed - this.avgSpeed) / this.count;

        if (this.previousFuel > streams.engineInfo[11]) {
            this.fuelConsumptionRate = (1 - this.timer) * wheelspeed / (this.previousFuel - streams.engineInfo[11]); // In m/l
        } else {
            this.fuelConsumptionRate = 0;
        }
        this.previousFuel = streams.engineInfo[11];

        this.range = this.fuelConsumptionRate * streams.engineInfo[11] / 1000;

        this.avgFuelConsumptionRate += (this.fuelConsumptionRate - this.avgFuelConsumptionRate) / this.count;

        this.timer = 1;
    }

    var value;
    var unit;
    var display;

    switch (this.persistance.mode) {
        case 0:
            if (this.persistance.Unit === "Metric") {
                value = (this.totalDistance/1000).toFixed(1);
                unit = "km";
            } else {
                value = (this.totalDistance/1609).toFixed(1);
                unit = "mi";
            }
            display = "Total Distance";
            break;
        case 1:
            if (this.persistance.Unit === "Metric") {
                value = (this.avgSpeed*3.6).toFixed(1);
                unit = "km/h";
            } else {
                value = (this.avgSpeed*3.6/1.60934).toFixed(1);
                unit = "MPH";
            }
            display = "AVG Speed";
            break;
        case 2:
            if (this.persistance.Unit === "Metric") {
                value = (100000/this.avgFuelConsumptionRate).toFixed(1);
                unit = "L/100km";
            } else {
                value = (this.avgFuelConsumptionRate * 0.00235214583).toFixed(1);
                unit = "MPG (US)";
            }
            display = "AVG Fuel Consu.";
            break;
        case 3:
            if (this.persistance.Unit === "Metric") {
                value = (100000/this.fuelConsumptionRate).toFixed(1);
                unit = "L/100km";
            } else {
                value = (this.fuelConsumptionRate * 0.00235214583).toFixed(1);
                unit = "MPG (US)";
            }
            display = "Fuel Consumption";
            break;
         case 4:
            if (this.persistance.Unit === "Metric") {
                value = (this.range).toFixed(1);
                unit = "km";
            } else {
                value = (this.range / 1.609).toFixed(1);
                unit = "mi";
            }
            display = "Range";
            break;
    }

    this.dataDiv.html(value);
    this.unitDiv.html(unit);
    this.labelDiv.html(display);
};
