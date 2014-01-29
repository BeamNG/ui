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
	},

	close:function(){
		AppEngine.unregisterApp(this.app);

		this._super("close");
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

//-----------------------------------------------------------------
$(document).ready(function() {
	AppEngine.initialize();
});


// Appengine ------------------------------------------------------

var AppEngine = {
	appList : [],
	installedApps : [],

	initialize : function(){
		installedApps = ["Tach","WheelsScreen"]; // Call a beamNG function later

		$.ajaxPrefilter( "json script", function( options ) {
			options.crossDomain = true;
		});

		// Load all apps
		for (var i = 0; i<installedApps.length;i++) {
			console.warn("Appnr: "+i);
			app = installedApps[i];
			this._loadAppJs(app);
		}
	},

	_loadAppJs : function(app){
			$.getScript( "apps/"+app+"/"+app+".js", function( data, textStatus, jqxhr ) {
				console.log( "loading app '"+app+"'" );
				console.log( textStatus ); // Success
				id = Math.random()*100;
				$('body').append('<div id="app'+app+'"></div>');
				$('#app'+app).app({ app: new window[app]() });
			});
	},

	_setInstalledApps : function(appList){
		installedApps = appList;
	},

	update : function(data){
		for(var j = 0; j<this.appList.length; j++){
			var app = this.appList[j];
			var streamList = {};
			for(var i=0; i<app.info.streams.length; i++){
				stream = app.info.streams[i];
					if(state.streams[stream] == 1 || stream == "electrics"){ // hack
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
		this.appList.splice(this.appList.indexOf(app),1);
		// removing streams
		for(var i=0; i<app.info.streams.length; i++){
			if(app.info.streams[i] == "electrics") // hack
				continue;
			streamRemove(app.info.streams[i]);
		}
	},

	loadApp : function(appname){

	},

	loadPreset : function(preset){

	},

	savePreset : function(preset){

	},

	toggleEditmode : function(){

	}
};