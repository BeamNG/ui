function SimpleEngineDebug(){}

SimpleEngineDebug.prototype.initialize = function(){
    this.text = $('<div style="background:RGBA(255,255,255,0.75);padding:5px;"></div>').appendTo(this.rootElement);
};

oldtime = 0;
newtime = 0;
timer = 1;

previousfuel = 0;
fuelconsumptionrate = 0;
distance = 0;

SimpleEngineDebug.prototype.update = function(streams){
    
    str =  "Engine RPM: " + streams["engineInfo"][4].toFixed();

	gear = streams["engineInfo"][5];
	if(gear>0){
		str += "<br> Gear: F " + gear + " / " + streams["engineInfo"][6];
	}else if(gear<0){
		str += "<br> Gear:  R " + Math.abs(gear) + " / " + streams["engineInfo"][7];
	}else{
		str += "<br> Gear: N";
	}

	str += "<br> Engine Torque: " + streams["engineInfo"][8].toFixed() + " N m";
	str += "<br> Wheel Torque: " + streams["engineInfo"][9].toFixed() + " N m";
    str += "<br> Power: " + (streams["engineInfo"][4]*streams["engineInfo"][9]*Math.PI/30000).toFixed(2) + " kW" ;
    str += "<br> Airspeed: " + (streams["electrics"].airspeed*3.6).toFixed(2) + " km/h";
    str += "<br> Fuel: " + streams["engineInfo"][11].toFixed(2) + " L / " + streams["engineInfo"][12].toFixed(2) + " L, " + ((streams["engineInfo"][11]/streams["engineInfo"][12])*100.).toFixed(2) + "%"
    
    oldtime = newtime;
    newtime = performance.now()/1000;
    dt = newtime-oldtime;
    
    timer = timer - dt;
    if (timer < 0) {
        if (previousfuel > streams["engineInfo"][11]){
            distance = (1-timer) * streams["electrics"].wheelspeed;
            fuelconsumptionrate =  distance / (previousfuel - streams["engineInfo"][11]); // meters / liter
        } else {
            fuelconsumptionrate = 0;
        }
        previousfuel = streams["engineInfo"][11];
        timer = 1;
    }
    
    str += "<br> Fuel Consumption:" + (100000 / fuelconsumptionrate).toFixed(5);
    
    this.text.html(str);
};