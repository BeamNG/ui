

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

		// Initialize App
		this.app.initialize($(this.element).children("ui-dialog-content"));

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

//-----------------------------------------------------------------
function HudApp () {
	this.info = {
		title: "Testapp",
		preferredSize: [300,"auto"],
		streams: []
	};
}
HudApp.prototype.initialize = function(rootElement){};
HudApp.prototype.update = function(streams){};
//-----------------------------------------------------------------
function Tach(){
	HudApp();
	this.info = {
		title: "Tacho",
		preferredSize: [300,"auto"],
		streams: ["vehicleinfo"]
	};
}
Tach.prototype = new HudApp();
Tach.prototype.constructor = Tach;
Tach.parent = HudApp.prototype;

Tach.prototype.initialize = function(rootElement){
	this.rootElement = rootElement;

	$(this.rootelement).append("<span id='speed'> Speedo</span>");
};

Tach.prototype.update = function(streams){
//	console.log(JSON.stringify(streams));
//	$("#speed").html(streams["vehicleinfo"]);
};



//----------------------------------------------------------------
$(document).ready(function() {
	$('body').append('<div class="app"></div>');
	$('.app').app({ app: new Tach() });
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
				if(state.streams[stream] == 1){
					console.log(stream);
					streamList[stream] = data[stream];
					console.log(streamList[stream]);
				}
			}
			app.update(streamList);
		}
	},
	registerApp : function(app){
		this.appList.push(app);
		//Adding streams
		for(var i=0; i<app.info.streams.length; i++){
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