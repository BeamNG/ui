function DebugApp(){}

DebugApp.prototype.initialize = function(){
	this.accordion = $("<div></div>").appendTo(this.rootElement);
//	this.changeVehicle = this.addSection("Change Vehicle");
//	this.levels = this.addSection("Levellist");
//	this.apps = this.addSection("Applist");
//	this.vehicles = this.addSection("Vehiclelist");
//	$("<a>Fullsize</a>").appendTo(this.changeVehicle).button().click(function(event) {
//		beamng.sendGameEngine('chooseVehicle( "fullsize", "vehicles/fullsize/drift.pc", "", 1);');
//	});
//	$("<a>Pickup</a>").appendTo(this.changeVehicle).button().click(function(event) {
//		beamng.sendGameEngine('chooseVehicle( "pickup", "vehicles/pickup/sport.pc", "", 0);');
//	});
//	var self = this;
//	callGameEngineFuncCallback("getLevelList()", function(res){self.levels.html(JSON.stringify(res));});
//	callGameEngineFuncCallback("getAppList()", function(res){self.apps.html(JSON.stringify(res));});
//	callGameEngineFuncCallback("getVehicleList()", function(res){self.vehicles.html(JSON.stringify(res)); self.vehiclelist = res;});

	//this.accordion.accordion({heightStyle: "content", collapsible: true});
	this.position = this.addSection("Position");
	this.angles = this.addSection("Angles");
};

DebugApp.prototype.update = function(streams){
	var pos = streams.sensors.position;
	var sensors = streams.sensors;
	this.position.html(pos.x.toFixed(2) +" x "+ pos.y.toFixed(2) +" x "+ pos.z.toFixed(2));
	this.angles.html(
			"Roll:" + sensors.roll.toFixed(2) + "<br>" +
			"Pitch:" + sensors.pitch.toFixed(2) + "<br>" +
			"Yaw:" + sensors.yaw.toFixed(2) );
};

DebugApp.prototype.addSection = function(name){
	$("<h2>"+name+"</h2>").appendTo(this.accordion);
	var container = $("<div></div>").appendTo(this.accordion);
	return container;
};

DebugApp.prototype.resize = function(){
	this.log("Debug resize");
};
