function SimplePerfTimers(){}

SimplePerfTimers.prototype.initialize = function(){
    this.table = $('<table><thead><tr> <th> <b>Type</b> </th> <th> <b>Start <br>(km/h)</b> </th> <th> <b>End <br>(km/h)</b> </th> <th> <b>Time <br>(s)</b> </th> <th> <b>Distance <br>(m)</b> </th></tr></thead><tbody id="resultstable"><tr></tr></tbody></table>').appendTo(this.rootElement).addClass('table');
    this.div = $('<div></div>').appendTo(this.rootElement).addClass('div');

    this.wheelTimer      = 0;
    this.wheelTimerState = 0;   // 0 - No timer / 1 - Acceleration / 3 - braking
    this.timerSpeedLimit = 100; // km/h
    this.speedMargin     = 0.5;
    this.startPos        = null;
    this.startVelo       = null;
    this.stopVelo        = null;
    this.testing         = "";
    this.aborted         = "";

    this.prevTime        = 0;
    this.curTime         = 0;
};

function appendToTable (data) {
    $('#resultstable tr:first').before('<tr style="text-align:right;"> <td style="text-align:center;"> ' + data[0] + ' </td> <td> ' + data[1] + ' </td> <td> ' + data[2] + ' </td> <td> ' + data[3] + ' </td> <td> ' + data[4] + ' </td> </tr>');
}

SimplePerfTimers.prototype.update = function(streams){

    var airspeed = (streams.electrics.airspeed*3.6).toFixed(2);
    var throttle = streams.electrics.throttle.toFixed(2);
    var brake    = streams.electrics.brake.toFixed(2);
    var position = streams.sensors.position;

    this.prevTime = this.curTime;
    this.curTime  = performance.now();
    var dt = (this.curTime - this.prevTime)/1000;

    // speed this.testing
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

            appendToTable(["Speed", Math.floor(this.startVelo), Math.floor(this.stopVelo), this.wheelTimer.toFixed(2), distance.toFixed(2)]);
        }
        if (throttle < 0.5) {
            // console.log("this.ABORTED");
            this.aborted = "this.Aborted: Throttle < 0.5";
            this.wheelTimerState = 0;
        }
    }
    if (this.wheelTimerState == 1) {
        this.testing = "Speed this.Testing... " + airspeed + " km/h, " + this.wheelTimer.toFixed(2) + " s";
    }

    //brake this.testing
    if (brake > 0.5 && airspeed > this.timerSpeedLimit - this.speedMargin && airspeed > this.timerSpeedLimit - this.speedMargin && this.wheelTimerState === 0) {
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

            appendToTable(["Brake", Math.floor(this.startVelo), Math.floor(this.stopVelo), this.wheelTimer.toFixed(2), distance]);
        }
        if (brake < 0.5) {
            // console.log("this.ABORTED");
            this.aborted = "this.Aborted: Brake < 0.5";
            this.wheelTimerState = 0;
        }
    }
    if (this.wheelTimerState == 3) {
        this.testing = "Brake this.Testing... " + airspeed + " km/h, " + this.wheelTimer.toFixed(2) + " s";
    }
    var str =  this.testing;
    str    += "<br>" + this.aborted;

    this.div.html(str);
};
