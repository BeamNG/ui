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

var timer    = 0;
var prevTime = 0;
var curTime  = 0;

var count         = 0;
var totalDistance = 0;
var avgSpeed      = 0;

var fuelConsumptionRate      = 0;
var avgFuelConsumptionRate   = 0;
var previousFuel             = 0;

SimpleTrip.prototype.update = function (streams) {

    var wheelspeed = streams.electrics.wheelspeed;

    prevTime = curTime;
    curTime  = performance.now();
    var dt = (curTime - prevTime)/1000;

    timer = timer - dt;
    if(timer < 0) {
        totalDistance += ((1 - timer) * wheelspeed);

        count++;

        avgSpeed += (wheelspeed - avgSpeed) / count;

        if (previousFuel > streams.engineInfo[11]) {
            fuelConsumptionRate = (1 - timer) * wheelspeed.toFixed(1) / (previousFuel - streams.engineInfo[11]); // In m/l
        } else {
            fuelConsumptionRate = 0;
        }
        previousFuel = streams.engineInfo[11];

        avgFuelConsumptionRate += (fuelConsumptionRate - avgFuelConsumptionRate) / count;

        timer = 1;
    }

    var value;
    var unit;
    var display;

    switch (this.persistance.mode) {
        case 0:
            if (this.persistance.Unit === "Metric") {
                value = (totalDistance/1000).toFixed(1);
                unit = "km";
            } else {
                value = (totalDistance/1609).toFixed(1);
                unit = "mi";
            }
            display = "Total Distance";
            break;
        case 1:
            if (this.persistance.Unit === "Metric") {
                value = (avgSpeed*3.6).toFixed(1);
                unit = "km/h";
            } else {
                value = (avgSpeed*3.6/1.60934).toFixed(1);
                unit = "MPH";
            }
            display = "AVG Speed";
            break;
        case 2:
            if (this.persistance.Unit === "Metric") {
                value = (100000/avgFuelConsumptionRate).toFixed(1);
                unit = "L/100km";
            } else {
                value = (avgFuelConsumptionRate * 0.00235214583).toFixed(1);
                unit = "MPG (US)";
            }
            display = "AVG Fuel Consu.";
            break;
        case 3:
            if (this.persistance.Unit === "Metric") {
                value = (100000/fuelConsumptionRate).toFixed(1);
                unit = "L/100km";
            } else {
                value = (fuelConsumptionRate * 0.00235214583).toFixed(1);
                unit = "MPG (US)";
            }
            display = "Fuel Consumption";
            break;
         case 4:
            if (this.persistance.Unit === "Metric") {
                value = (fuelConsumptionRate * streams.engineInfo[11] / 1000).toFixed(0);
                unit = "km";
            } else {
                value = (fuelConsumptionRate * streams.engineInfo[11] / 1609).toFixed(1);
                unit = "mi";
            }
            display = "Range";
            break;
    }

    this.dataDiv.html(value);
    this.unitDiv.html(unit);
    this.labelDiv.html(display);
};
