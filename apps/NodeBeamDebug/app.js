function NodeBeamDebug(){}

NodeBeamDebug.prototype.initialize = function(){};

NodeBeamDebug.prototype.update = function(streams){
	str =  streams["stats"].beam_count + " beams <br>";
	str	+= " - " + streams["stats"].beams_deformed + " ("+((streams["stats"].beams_deformed/streams["stats"].beam_count)*100).toFixed(2)+"%) deformed <br>";
	str	+= " - " + streams["stats"].beams_broken + " ("+((streams["stats"].beams_broken/streams["stats"].beam_count)*100).toFixed(2)+"%) broken <br>";
	
	str += streams["stats"].node_count + " nodes <br>";
	str += " - " + streams["stats"].total_weight.toFixed(2)+ " kg total weight <br>";
	str += " - " + (streams["stats"].wheel_weight/streams["stats"].wheel_count).toFixed(2) + " kg per wheel";
	str += " (" + streams["stats"].wheel_weight.toFixed(2)+ " kg all "+ streams["stats"].wheel_count +" wheels) <br>";
	str += " - " + (streams["stats"].total_weight - streams["stats"].wheel_weight).toFixed(2) + " kg chassis weight";
	
	$(this.rootElement).html(str);
};
