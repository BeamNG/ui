function SimplePerfTimers(){}

SimplePerfTimers.prototype.initialize = function(){
    this.table = $('<table><thead><tr> <th> <b>Type</b> </th> <th> <b>Start</b> </th> <th> <b>End</b> </th> <th> <b>Time</b> </th> <th> <b>Distance</b> </th></tr></thead><tbody id="resultstable"><tr></tr></tbody></table>').appendTo(this.rootElement).addClass('table');
    this.div = $('<div></div>').appendTo(this.rootElement).addClass('div');

    this.wheelTimer      = 0;
    this.wheelTimerState = 0;   // 0 - No timer / 1 - Acceleration / 3 - braking
    this.timerSpeedLimit = null;
    this.speedMargin     = 0.5;
    this.startPos        = null;
    this.startVelo       = null;
    this.stopVelo        = null;
    this.testing         = "";
    this.aborted         = "";

    this.prevTime        = 0;
    this.curTime         = 0;



    //If no unit was previously selected, default to km/h
    if ((this.persistance.Unit != "Imperial") && (this.persistance.Unit != "Metric")) this.persistance.Unit = "Metric";

    var self = this;
    this.table.click(function(){self.toggleUnit();});
};

SimplePerfTimers.prototype.toggleUnit = function(){
    //Toggle between Imperial and Metric, save the option to persistance system
    this.persistance.Unit = this.persistance.Unit === 'Imperial' ? 'Metric' : 'Imperial';
	HookManager.trigger('Message',{msg:'Switched SimplePerfTimers to ' + this.persistance.Unit + " speed",ttl: 2});
    this.save();
};

function appendToTable (data) {
    $('#resultstable tr:first').before('<tr style="text-align:right;"> <td style="text-align:center;"> ' + data[0] + ' </td> <td> ' + data[1] + ' </td> <td> ' + data[2] + ' </td> <td> ' + data[3] + ' </td> <td> ' + data[4] + ' </td> </tr>');
}

SimplePerfTimers.prototype.update = function(streams){


    var throttle = streams.electrics.throttle.toFixed(2);
    var brake    = streams.electrics.brake.toFixed(2);
    var position = streams.sensors.position;

    if (this.persistance.Unit == "Metric"){
		var airspeed = (streams.electrics.airspeed*3.6).toFixed(2);
		var speedUnits = "km/h";
		this.timerSpeedLimit = 100;
    }
	else {
		var airspeed = (streams.electrics.airspeed*2.23693629).toFixed(2);
		var speedUnits = "MPH";
		this.timerSpeedLimit = 60;
	}


    this.prevTime = this.curTime;
    this.curTime  = performance.now();
    var dt = (this.curTime - this.prevTime)/1000;

    // speed testing
    if (throttle > 0.5 && airspeed > this.speedMargin && airspeed < this.speedMargin*3 && this.wheelTimerState === 0) {
        this.wheelTimerState = 1;
        this.wheelTimer      = 0;
        this.startPos        = position;
        this.startVelo       = airspeed;
        this.aborted         = "";
        this.testing         = "";
    } else if (this.wheelTimerState == 1) {
        this.wheelTimer = this.wheelTimer + dt;
        if (airspeed > this.timerSpeedLimit) {
            // console.log("TOP SPEED")
            var  stopPos    = position;
            this.stopVelo        = airspeed;
            var distance    = Math.sqrt( Math.pow((stopPos.x - this.startPos.x), 2) + Math.pow((stopPos.y - this.startPos.y), 2) );
            this.wheelTimerState = 0;
            this.testing         = "";

            appendToTable(["Speed", Math.floor(this.startVelo) + " " + speedUnits, Math.floor(this.stopVelo) + " " + speedUnits, this.wheelTimer.toFixed(2) + " s", distance.toFixed(2) + " m"]);
        }
        if (throttle < 0.5) {
            // console.log("ABORTED");
            this.aborted = "Aborted: Throttle < 0.5";
            this.wheelTimerState = 0;
        }
    }
    if (this.wheelTimerState == 1) {
        this.testing = "Speed Testing... " + airspeed + " " + speedUnits + ", " + this.wheelTimer.toFixed(2) + " s";
    }

    //brake testing
    if (brake > 0.5 && airspeed > 10 - this.speedMargin && this.wheelTimerState === 0) {
        this.wheelTimerState = 3;
        this.wheelTimer      = 0;
        this.startPos        = position;
        this.startVelo       = airspeed;
        this.aborted         = "";
        this.testing         = "";
    } else if (this.wheelTimerState == 3) {
        this.wheelTimer = this.wheelTimer + dt;
        if (airspeed < this.speedMargin) {
            // console.log("STOPPED")
            var  stopPos         = position;
            this.stopVelo        = airspeed;
            var distance          = Math.sqrt( Math.pow((stopPos.x - this.startPos.x), 2) + Math.pow((stopPos.y - this.startPos.y), 2) ).toFixed(2);
            this.wheelTimerState = 0;
            this.testing         = "";

            appendToTable(["Brake", Math.floor(this.startVelo) + " " + speedUnits, Math.floor(this.stopVelo) + " " + speedUnits, this.wheelTimer.toFixed(2) + " s", distance + " m"]);
        }
        if (brake < 0.5) {
            // console.log("ABORTED");
            this.aborted = "Aborted: Brake < 0.5";
            this.wheelTimerState = 0;
        }
    }
    if (this.wheelTimerState == 3) {
        this.testing = "Brake Testing... " + airspeed + " " + speedUnits + ", " + this.wheelTimer.toFixed(2) + " s";
    }
    var str =  this.testing;
    str    += "<br>" + this.aborted;

    this.div.html(str);
};
