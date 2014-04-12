function Debug(){}

Debug.prototype.initialize = function(){
	this.display = $("<span>"+this.persistance["rand"]+"</span>").appendTo(this.rootElement);
	self = this;
	$("<a href='#'>setrandomvalue</a>").click(function(){self.randomValue();}).appendTo(this.rootElement);
};

Debug.prototype.randomValue = function(){
		this.persistance["rand"] = Math.floor((Math.random()*10)+1);
		this.display.html(this.persistance["rand"]);
		this.save();
};

Debug.prototype.update = function(streams){
	if(streams["torqueCurve"]!== undefined){
		console.log(streams["torqueCurve"]);
		this.torqueCurve = streams["torqueCurve"][0];
		this.hpCurve = streams["torqueCurve"][1];
	}
	

	if(this.torqueCurve !== undefined){
		rpm = streams["engineInfo"][4];
		$(this.rootElement).html("RPM: "+toInt(rpm)+"<br>Torque: "+toInt(this.torqueCurve[toInt(rpm)])+"<br>HP: "+toInt(this.hpCurve[toInt(rpm)]));
	}
};

Debug.prototype.resize = function(){
	console.log("Debug resize");
};
