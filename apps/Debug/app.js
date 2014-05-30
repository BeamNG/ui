function Debug(){}

Debug.prototype.initialize = function(){
	$("<br><br>").appendTo(this.rootElement);
	this.display1 = $("<span></span>").appendTo(this.rootElement);
	$("<br><br>").appendTo(this.rootElement);
	this.display2 = $("<span></span>").appendTo(this.rootElement);

	var self = this;
	callGameEngineFuncCallback("getLevelList()", function(res){self.display1.html("LevelList: "+JSON.stringify(res));});
	callGameEngineFuncCallback("getAppList()", function(res){self.display2.html("AppList: "+JSON.stringify(res));});
};

Debug.prototype.update = function(streams){
	//callLuaFuncCallback("1+1", function(res){self.display2.html("Calculating 1+1 with Lua: "+res);});
};

Debug.prototype.resize = function(){
	this.log("Debug resize");
};
