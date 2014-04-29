function Debug(){}

Debug.prototype.initialize = function(){
	$("<br><br>").appendTo(this.rootElement);
	this.display = $("<span></span>").appendTo(this.rootElement);
};

Debug.prototype.update = function(streams){
	var position = this._widget.app("option","position");
	var refPointOffset = this._widget.app("option","refPointOffset");
	var referencePoint = this._widget.app("option","referencePoint");

	var debugstr = "Position: ["+position[0]+","+position[1] + "]<br>";
	debugstr += "referencePoint: ["+referencePoint[0]+","+referencePoint[1] + "]<br>";
	debugstr += "refPointOffset: ["+refPointOffset[0]+","+refPointOffset[1] + "]";
	this.display.html(debugstr);
};

Debug.prototype.resize = function(){
	console.log("Debug resize");
};
