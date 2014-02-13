function Tach(){
	this.info = {
		title: "Tacho",
		preferredSize: [90,70],
		streams: ["engineInfo", "electrics"]
	};
}

Tach.prototype.initialize = function(){
	$(this.rootElement).css('background-color', 'RGBA(255,255,255,0.9)');
};

Tach.prototype.update = function(streams){
	$(this.rootElement).html("rpm: "+streams["engineInfo"][4].toFixed() + "<br /> Speed: "+(streams["electrics"]["wheelspeed"]*3.6).toFixed());//streams["vehicleinfo"]);
};

Tach.prototype.resize = function(){
	console.log("Tach resize");
};
