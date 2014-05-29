function Debug(){}

Debug.prototype.initialize = function(){
	$("<br><br>").appendTo(this.rootElement);
	this.display1 = $("<span></span>").appendTo(this.rootElement);
	$("<br>").appendTo(this.rootElement);
	this.display2 = $("<span></span>").appendTo(this.rootElement);
};

Debug.prototype.update = function(streams){
	var self = this;
	callGameEngineFuncCallback("1+1", function(res){self.display1.html("Calculating 1+1 with Torquescript: "+res);});
	callLuaFuncCallback("1+1", function(res){self.display2.html("Calculating 1+1 with Lua: "+res);});
};

Debug.prototype.resize = function(){
	this.log("Debug resize");
};
