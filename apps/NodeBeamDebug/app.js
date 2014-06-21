function NodeBeamDebug(){}

NodeBeamDebug.prototype.initialize = function(){
    if(this.persistance.Unit === undefined){
        this.persistance.Unit = "metric";
    }

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
    this.rootElement.click(function(event) {self.toggleUnit();});
};

NodeBeamDebug.prototype.update = function(streams){
    str =  streams.stats.beam_count + " beams <br>";
    str    += " - " + streams.stats.beams_deformed + " ("+((streams.stats.beams_deformed/streams.stats.beam_count)*100).toFixed(2)+"%) deformed <br>";
    str    += " - " + streams.stats.beams_broken + " ("+((streams.stats.beams_broken/streams.stats.beam_count)*100).toFixed(2)+"%) broken <br>";

    str += streams.stats.node_count + " nodes <br>";
    str += " - " + this.toUnitString(streams.stats.total_weight)+ " "+this.data.unitname[this.persistance.Unit]+" total weight <br>";
    str += " - " + this.toUnitString(streams.stats.wheel_weight/streams.stats.wheel_count) + " "+this.data.unitname[this.persistance.Unit]+" per wheel";
    str += " (" + this.toUnitString(streams.stats.wheel_weight)+ " "+this.data.unitname[this.persistance.Unit]+" all "+ streams.stats.wheel_count +" wheels) <br>";
    str += " - " + this.toUnitString(streams.stats.total_weight - streams.stats.wheel_weight) + " "+this.data.unitname[this.persistance.Unit]+" chassis weight";

    $(this.rootElement).html(str);
};

NodeBeamDebug.prototype.toggleUnit = function(){
    //Toggle between MPH and km/h, save the option to persistance system
    this.persistance.Unit = this.persistance.Unit === 'imperial' ? 'metric' : 'imperial';
    this.save();
};

NodeBeamDebug.prototype.toUnitString = function(value){
    return (value*this.data.factor[this.persistance.Unit]).toFixed(2);
};
