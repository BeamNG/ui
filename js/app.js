

$.widget( "beamNG.app", $.ui.dialog, {
	options: {
		app: null,
	},

	_init:function(){


		this.app = this.options.app;
		this.appInfo = this.app.info;

		// Setting title
		this._setOption("title",this.appInfo.title);
		
		// Setting size
		if(this.appInfo.preferredSize){
			this._setOption("width",this.appInfo.preferredSize[0]);
			this._setOption("height",this.appInfo.preferredSize[1]);
		}


		//  Initialize Widget
		this._super("_init");

		// Setting rootElement
		this.app.rootElement = $(this.element);

		// Initialize App
		this.app.initialize();

		// Register App
		AppEngine.registerApp(this.app);
	},
	_destroy:function(){
		this._super("_destroy");

		// unregister App
		AppEngine.unregisterApp(this.app);

		this.element.remove();
	}

});

//----Template-----------------------------------------------------
function HudApp () {
	this.info = {
		title: "Testapp",
		preferredSize: [300,"auto"],
		streams: []
	};
}
HudApp.prototype.initialize = function(){};
HudApp.prototype.update = function(streams){};

//----Test----------------------------------------------------------
function Tach(){
	this.info = {
		title: "Tacho",
		preferredSize: [300,"auto"],
		streams: ["vehicleInfo", "electrics"]
	};
}

Tach.prototype.initialize = function(){
};

Tach.prototype.update = function(streams){
	$(this.rootElement).html("rpm: "+streams["vehicleInfo"][1][4].toFixed() + "<br /> Speed: "+(streams["electrics"]["wheelspeed"]*3.6).toFixed());//streams["vehicleinfo"]);
};

// Wheelsscreen ---------------------------------------------------
function WheelsScreen(){
	this.info = {
		title: "Wheelsdebug",
		preferredSize: [260,"auto"],
		streams: ["vehicleInfo"]
	};
}

WheelsScreen.prototype.initialize = function(){
	$(this.rootElement).html("<canvas class='drawingcanvas'></canvas>");
	this.canvas = $(this.rootElement).children('.drawingcanvas')[0];
	this.canvas.width=220;
	$(this.rootElement).css("background-color","white");
};

WheelsScreen.prototype.update = function(streams){
	value = streams['vehicleInfo'][0];
	/* value format:
	0  wd.name
	1  wd.radius
	2  wd.wheelDir
	3  w.angularVelocity
	4  w.lastTorque
	5  drivetrain.wheelInfo[wd.wheelID].lastSlip
	6  wd.lastTorqueMode
	*/
	var c = $(this.canvas)[0];
	var ctx = c.getContext('2d');

	// clear
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.restore();
	ctx.textAlign = 'center';
	var fontSize = 12;
	ctx.font = 'bold ' + fontSize + 'pt monospace';
	var r = 50;
	var rs = 5;
	var b = 5;
	var x = r + b;
	var y = r + b;
	for(var i in value) {
		var w = value[i];
		// then draw
		ctx.fillText('wheel' + w[0], x, y);
		filledArc(ctx, x, y, r, 1, 1, '#444444');

		var wheelSpeed = w[3] * w[1] * w[2];
		ctx.fillText(Math.floor(wheelSpeed * 3.6) + ' kph'    , x, y + fontSize + 3);
		ctx.fillText(Math.floor(wheelSpeed * 2.23694) + ' mph', x, y + 2 * (fontSize + 3));
		filledArc(ctx, x, y, r - 1, rs, wheelSpeed/33, 'rgb(0,128,128)');

		filledArc(ctx, x, y, r - 1 - rs, rs, w[5]/10 , 'rgb(128,128,0)');
		
		var torque = (w[4] * w[2]) / 10000;
		var col = 'rgb(128,0,128)';
		if(w[6] == 1) {
			col = 'rgb(128,128,0)';
		} else if(w[6] == 2) {
			col = 'rgb(128,0,0)';
		}
		filledArc(ctx, x, y, r - 1 - rs * 2, rs, torque, col);


		x += 2 * r +  5;

		if(x + r >= c.width) {
			x = r + b;
			y += 2 * r + 5;
		}
	}
	y -= r;
	if(c.height < y)
	{
		c.height = y;
	}

};




//-----------------------------------------------------------------
$(document).ready(function() {
	$('body').append('<div id="app001"></div>');
	$('#app001').app({ app: new Tach() });

	$('body').append('<div id="app002"></div>');
	$('#app002').app({ app: new WheelsScreen() });
});


// Appengine ------------------------------------------------------

var AppEngine = {
	appList : [],

	update : function(data){
		for(var j = 0; j<this.appList.length; j++){
			var app = this.appList[j];
			var streamList = {};
			for(var i=0; i<app.info.streams.length; i++){
				stream = app.info.streams[i];
				if(state.streams[stream] == 1 || stream == "electrics"){ // hack
					console.log(data["electrics"]["wheelspeed"]);
					streamList[stream] = data[stream];
				}
			}
			app.update(streamList);
		}
	},
	registerApp : function(app){
		this.appList.push(app);
		//Adding streams
		for(var i=0; i<app.info.streams.length; i++){
			if(app.info.streams[i] == "electrics") // hack
				continue;
			streamAdd(app.info.streams[i]);
		}
	},
	unregisterApp : function(app){
		appList.splice(appList.indexOf(app),1);
		// removing streams
		for(var i=0; i<app.info.streams.length; i++){
			streamRemove(app.info.streams[i]);
		}
	},
	loadDesktop : function(){

	},
	saveDesktop : function(){

	},
	toggleEditmode : function(){

	}
};