function Debug(){
	this.info = {
		title: "Debug (Torquecurve)",
		preferredSize: [500,200],
		streams: ["torqueCurve", "engineInfo"]
	};
}

Debug.prototype.initialize = function(){
	this.canvas = $("<canvas></canvas>").appendTo(this.rootElement).css({
		width: '500',
		height: '200'
	})[0];
	this.canvas.width = 500;
	this.canvas.height = 200;
};

Debug.prototype.update = function(streams){
	if(streams["torqueCurve"]!== undefined){
		console.log(streams["torqueCurve"]);
		this.torqueCurve = streams["torqueCurve"][0];
		this.hpCurve = streams["torqueCurve"][1];
	}
	ctx = this.canvas.getContext("2d");
	


	rpm = streams["engineInfo"][4];
//	$(this.rootElement).html("RPM: "+rpm+"<br>Torque: "+streams["torqueCurve"][Math.floor(rpm/9.5493)]);
};

Debug.prototype.resize = function(){
	console.log("Debug resize");
}
