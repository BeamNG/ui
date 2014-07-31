function SimpleEngineDebug(){}

SimpleEngineDebug.prototype.initialize = function(){
    this.text = $('<div style="padding:5px;"></div>').appendTo(this.rootElement).addClass("text");

    var self = this;
    this.text.click(function(){self.toggleUnits();});

    //If no unit was previously selected, default to Metric
    if ((this.persistance.Unit != "Imperial") && (this.persistance.Unit != "Metric")) this.persistance.Unit = "Metric";

    this.timer    = 0;
    this.prevTime = 0;
    this.curTime  = 0;

    this.fuelConsumptionRate = 0;
    this.wheelspeed          = 0;
    this.previousFuel        = 0;
    this.range               = 0;
};

SimpleEngineDebug.prototype.toggleUnits = function(){
    //Toggle between Imperial and Metric, save the option to persistance system
    this.persistance.Unit = this.persistance.Unit === 'Imperial' ? 'Metric' : 'Imperial';
    this.save();
};



SimpleEngineDebug.prototype.update = function(streams){

    var str =  "Engine RPM: " + streams.engineInfo[4].toFixed();
    var gear = streams.engineInfo[5];

    this.prevTime = this.curTime;
    this.curTime  = performance.now();
    var dt = (this.curTime - this.prevTime)/1000;

    this.wheelspeed = streams.electrics.wheelspeed;

    this.timer = this.timer - dt;
    if(this.timer < 0) {
        if (this.previousFuel > streams.engineInfo[11]) {
            this.fuelConsumptionRate = (1 - this.timer) * this.wheelspeed / (this.previousFuel - streams.engineInfo[11]); // In m/l
        } else {
            this.fuelConsumptionRate = 0;
        }
        this.previousFuel = streams.engineInfo[11];
        this.range = this.fuelConsumptionRate * streams.engineInfo[11] / 1000;
        this.timer = 1;
    }

    if(gear>0){
        str += "<br> Gear: F " + gear + " / " + streams.engineInfo[6];
    }else if(gear<0){
        str += "<br> Gear:  R " + Math.abs(gear) + " / " + streams.engineInfo[7];
    }else{
        str += "<br> Gear: N";
    }

    if (this.persistance.Unit == "Metric"){
        str += "<br> Engine Torque: " + streams.engineInfo[8].toFixed() + " N m";
        str += "<br> Wheel Torque: " + streams.engineInfo[9].toFixed() + " N m";
        str += "<br> Power: " + (streams.engineInfo[4]*streams.engineInfo[9]*Math.PI/30000).toFixed(2) + " kW" ;
        str += "<br> Airspeed: " + (streams.electrics.airspeed*3.6).toFixed(2) + " km/h";
        str += "<br> Fuel: " + streams.engineInfo[11].toFixed(2) + " L/" + streams.engineInfo[12].toFixed(2) + " L, " + ((streams.engineInfo[11]/streams.engineInfo[12])*100).toFixed(2) + "%";
        str += "<br> Consumption: " + (100000 / this.fuelConsumptionRate).toFixed(2) + " L/100km";
        str += "<br> Range: " + (this.range).toFixed(2)  + " km";
    } else {
        str += "<br> Engine Torque: " + (streams.engineInfo[8]*1.356).toFixed() + " lb ft";
        str += "<br> Wheel Torque: " + (streams.engineInfo[9]*1.356).toFixed() + " lb ft";
        str += "<br> Power: " + ((streams.engineInfo[4]*streams.engineInfo[9]*Math.PI/30000)*0.7457).toFixed(2) + " hp" ;
        str += "<br> Airspeed: " + (streams.electrics.airspeed*2.23694).toFixed(2) + " MPH";
        str += "<br> Fuel: " + (streams.engineInfo[11]*0.2642).toFixed(2) + " gal/" + (streams.engineInfo[12]*0.2642).toFixed(2) + " gal, " + ((streams.engineInfo[11]/streams.engineInfo[12])*100).toFixed(2) + "%";
        str += "<br> Consumption: " + (this.fuelConsumptionRate * 0.00235214583).toFixed(2) + " mpg (US)";
        str += "<br> Range: " + (this.range / 1.609).toFixed(2)  + " mi";
    }

    this.text.html(str);
};
