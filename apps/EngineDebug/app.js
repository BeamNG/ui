function EngineDebug(){}

EngineDebug.prototype.initialize = function(){};

EngineDebug.prototype.update = function(streams){
    var str =  "rpm: " + streams.engineInfo[4].toFixed();

    var gear = streams.engineInfo[5];
    if(gear>0){
        str += "<br> gear: F " + gear + " / " + streams.engineInfo[6];
    }else if(gear<0){
        str += "<br> gear:  R " + Math.abs(gear) + " / " + streams.engineInfo[7];
    }else{
        str += "<br> gear: N";
    }

    str += "<br> engine torque: " + streams.engineInfo[8].toFixed() + " N m";
    str += "<br> wheel torque: " + streams.engineInfo[9].toFixed() + " N m";

    $(this.rootElement).html(str);
};
