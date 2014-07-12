function SimplePerfTimers(){}

SimplePerfTimers.prototype.initialize = function(){
    this.table = $('<table><thead><tr> <th> <b>Type</b> </th> <th> <b>Start <br>(km/h)</b> </th> <th> <b>End <br>(km/h)</b> </th> <th> <b>Time <br>(s)</b> </th> <th> <b>Distance <br>(m)</b> </th></tr></thead><tbody id="resultstable"><tr></tr></tbody></table>').appendTo(this.rootElement).addClass('table');
    this.div = $('<div></div>').appendTo(this.rootElement).addClass('div');
}

var wheelTimer      = 0;
var wheelTimerState = 0;
var timerSpeedLimit = 100; // km/h
var speedMargin     = 0.5;
var startPos        = null;
var startVelo       = null;
var stopVelo        = null;
var testing         = "";
var aborted         = "";

var prevTime        = 0;
var curTime         = 0;

SimplePerfTimers.prototype.update = function(streams){

    var airspeed = (streams.electrics.airspeed*3.6).toFixed(2);
    var throttle = streams.electrics.throttle.toFixed(2);
    var brake    = streams.electrics.brake.toFixed(2);
    var position = streams.sensors.position;

    prevTime = curTime;
    curTime  = performance.now();
    var dt = (curTime - prevTime)/1000;

    // speed testing
    if (throttle > 0.5 && airspeed > speedMargin && airspeed < speedMargin*3 && wheelTimerState == 0) {
        wheelTimerState = 1;
        wheelTimer      = 0;
        startPos        = position;
        startVelo       = airspeed;
        aborted         = "";
        testing         = "";
    } else if (wheelTimerState == 1) {
        wheelTimer = wheelTimer + dt;
        if (airspeed > timerSpeedLimit) {
            // console.log("TOP SPEED")
            var  stopPos    = position;
            stopVelo        = airspeed;
            var distance    = Math.sqrt( Math.pow((stopPos.x - startPos.x), 2) + Math.pow((stopPos.y - startPos.y), 2) );
            wheelTimerState = 0;
            testing         = "";

            appendToTable(["Speed", Math.floor(startVelo), Math.floor(stopVelo), wheelTimer.toFixed(2), distance.toFixed(2)])
        }
        if (throttle < 0.5) {
            // console.log("ABORTED");
            aborted = "Aborted: Throttle < 0.5"
            wheelTimerState = 0;
        }
    }
    if (wheelTimerState == 1) {
        testing = "Speed Testing... " + airspeed + " km/h, " + wheelTimer.toFixed(2) + " s";
    }

    //brake testing
    if (brake > 0.5 && airspeed > timerSpeedLimit - speedMargin && airspeed > timerSpeedLimit - speedMargin && wheelTimerState == 0) {
        wheelTimerState = 3;
        wheelTimer      = 0;
        startPos        = position;
        startVelo       = airspeed;
        aborted         = "";
        testing         = "";
    } else if (wheelTimerState == 3) {
        wheelTimer = wheelTimer + dt;
        if (airspeed < speedMargin) {
            // console.log("STOPPED")
            var  stopPos    = position;
            stopVelo        = airspeed;
            var distance    = Math.sqrt( Math.pow((stopPos.x - startPos.x), 2) + Math.pow((stopPos.y - startPos.y), 2) ).toFixed(2);
            wheelTimerState = 0;
            testing         = "";

            appendToTable(["Brake", Math.floor(startVelo), Math.floor(stopVelo), wheelTimer.toFixed(2), distance])
        }
        if (brake < 0.5) {
            // console.log("ABORTED");
            aborted = "Aborted: Brake < 0.5"
            wheelTimerState = 0;
        }
    }
    if (wheelTimerState == 3) {
        testing = "Brake Testing... " + airspeed + " km/h, " + wheelTimer.toFixed(2) + " s";
    }
    var str =  testing;
    str    += "<br>" + aborted;

    this.div.html(str);
};

function appendToTable (data) {
    $('#resultstable tr:first').before('<tr style="text-align:right;"> <td style="text-align:center;"> ' + data[0] + ' </td> <td> ' + data[1] + ' </td> <td> ' + data[2] + ' </td> <td> ' + data[3] + ' </td> <td> ' + data[4] + ' </td> </tr>');
};
