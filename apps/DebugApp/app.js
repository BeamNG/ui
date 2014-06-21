function DebugApp(){}

DebugApp.prototype.initialize = function(){
    this.accordion = $("<div></div>").appendTo(this.rootElement);
//    this.changeVehicle = this.addSection("Change Vehicle");
//    this.levels = this.addSection("Levellist");
//    this.apps = this.addSection("Applist");
//    this.vehicles = this.addSection("Vehiclelist");
//    $("<a>Fullsize</a>").appendTo(this.changeVehicle).button().click(function(event) {
//        beamng.sendGameEngine('chooseVehicle( "fullsize", "vehicles/fullsize/drift.pc", "", 1);');
//    });
//    $("<a>Pickup</a>").appendTo(this.changeVehicle).button().click(function(event) {
//        beamng.sendGameEngine('chooseVehicle( "pickup", "vehicles/pickup/sport.pc", "", 0);');
//    });
//    var self = this;
//    callGameEngineFuncCallback("getLevelList()", function(res){self.levels.html(JSON.stringify(res));});
//    callGameEngineFuncCallback("getAppList()", function(res){self.apps.html(JSON.stringify(res));});
//    callGameEngineFuncCallback("getVehicleList()", function(res){self.vehicles.html(JSON.stringify(res)); self.vehiclelist = res;});

    //this.accordion.accordion({heightStyle: "content", collapsible: true});
    this.position = this.addSection("Position");
    this.angles = this.addSection("Angles");
    this.canvas = {};
    this.canvas.roll = $('<canvas></canvas>').appendTo(this.rootElement);
    this.canvas.pitch = $('<canvas></canvas>').appendTo(this.rootElement);
    this.canvas.yaw = $('<canvas></canvas>').appendTo(this.rootElement);
    $.each(this.canvas, function(index, c) {
        c.css({
            width: 50,
            height: 50
        });
        c[0].width = 50;
        c[0].height = 50;
    });
};

DebugApp.prototype.update = function(streams){
    var pos = streams.sensors.position;
    var sensors = streams.sensors;
    var c, ctx;
    this.position.html(pos.x.toFixed(2) +" x "+ pos.y.toFixed(2) +" x "+ pos.z.toFixed(2));
    this.angles.html(
            "Roll:" + sensors.roll.toFixed(2) + "<br>" +
            "Pitch:" + sensors.pitch.toFixed(2) + "<br>" +
            "Yaw:" + sensors.yaw.toFixed(2) );

    //update roll
    c = this.canvas.roll[0];
    ctx = c.getContext('2d');
    ctx.clearRect(0,0,50,50);
    ctx.save();
    ctx.translate(25,25);
    ctx.rotate(Math.asin(-sensors.roll));
    ctx.beginPath();
    ctx.arc(15,10,5,0,2*Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-15,10,5,0,2*Math.PI);
    ctx.fill();
    ctx.fillRect(-20,-20,40,30);
    ctx.clearRect(-15,-15,30,10);
    ctx.restore();

    //update pitch
    c = this.canvas.pitch[0];
    ctx = c.getContext('2d');
    ctx.clearRect(0,0,50,50);
    ctx.save();
    ctx.translate(25,25);
    ctx.rotate(Math.asin(-sensors.pitch));
    ctx.fillRect(-20,-15,30,10);
    ctx.fillRect(-20,-8,40,10);
    ctx.beginPath();
    ctx.arc(-10,0,5,0,2*Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(10,0,5,0,2*Math.PI);
    ctx.fill();
    ctx.restore();

    // update yaw
    c = this.canvas.yaw[0];
    ctx = c.getContext('2d');
    ctx.clearRect(0,0,50,50);
    ctx.save();
    ctx.translate(25,25);
    ctx.rotate(-sensors.yaw);
    ctx.beginPath();
    ctx.arc(0,0,20,0,2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0,-20,5,0,2*Math.PI);
    ctx.fill();
    ctx.restore();

};

DebugApp.prototype.addSection = function(name){
    $("<h2>"+name+"</h2>").appendTo(this.accordion);
    var container = $("<div></div>").appendTo(this.accordion);
    return container;
};

DebugApp.prototype.resize = function(){
    this.log("Debug resize");
};
