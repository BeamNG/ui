function Stats(){
	this.info = {
		title: "Beaminfo",
		preferredSize: [300,"auto"],
		streams: ["stats"]
	};
}

Stats.prototype.initialize = function(){
	$(this.rootElement).css('background-color', 'RGBA(255,255,255,0.9)');
};

Stats.prototype.update = function(streams){
	str =  streams["stats"].beam_count + " beams <br>";
	str	+= " - " + streams["stats"].beams_deformed + " ("+((streams["stats"].beams_deformed/streams["stats"].beam_count)*100).toFixed(2)+"%) deformed <br>";
	str	+= " - " + streams["stats"].beams_broken + " ("+((streams["stats"].beams_broken/streams["stats"].beam_count)*100).toFixed(2)+"%) broken <br>";
	
	str += streams["stats"].node_count + " nodes <br>";
	str += " - " + streams["stats"].total_weight.toFixed(2)+ " kg total weight <br>";
	str += " - " + streams["stats"].wheel_weight.toFixed(2)+ " kg wheel weight <br>";
	
	$(this.rootElement).html(str);
};
