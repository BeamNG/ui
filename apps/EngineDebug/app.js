function EngineDebug(){
	this.info = {
		title: "EngineInfo",
		preferredSize: [300,"auto"],
		streams: ["engineInfo"]
	};
}

EngineDebug.prototype.initialize = function(){
	$(this.rootElement).css('background-color', 'RGBA(255,255,255,0.9)');
};

EngineDebug.prototype.update = function(streams){
	str =  "rpm: " + streams["engineInfo"][4].toFixed();

	gear = streams["engineInfo"][5];
	if(gear>0){
		str += "<br> gear: F " + gear + " / " + streams["engineInfo"][6];
	}else if(gear<0){
		str += "<br> gear:  R " + Math.abs(gear) + " / " + streams["engineInfo"][7];
	}else{
		str += "<br> gear: N";
	}

	str += "<br> engine torque: " + streams["engineInfo"][8].toFixed() + " N m";
	str += "<br> wheel torque: " + streams["engineInfo"][9].toFixed() + " N m";
	
	$(this.rootElement).html(str);
};
