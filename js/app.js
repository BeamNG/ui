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

//		this._tuneDialogStyle();
//		$(this).parents('.ui-dialog').draggable({'option', 'snap',true});
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
	},

	_tuneDialogStyle:function() {
		$(this.element).parent().find(".ui-dialog-titlebar").hide();
		this._on(this.element.parent(),
		{
			mouseenter:"mouseenter",
			mouseleave:"mouseleave"
		});
		//$(this.element).prev().find(".ui-dialog-title").append("<button class='ui-button-icon-primary ui-icon ui-icon-closethick'>minimize</button>");
	},

	mouseenter: function (e) {
		$(this.element).parent().find(".ui-dialog-titlebar").show('blind');
	},
	mouseleave: function (e) {
		$(this.element).parent().find(".ui-dialog-titlebar").hide('blind');
	},

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
	loadedApps : [],

	initialize : function(){
		installedApps = ["Tacho","WheelsScreen","Tach"]; // Call a beamNG function later

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
			$.getScript( "apps/"+app+"/"+app+".js", function( data, textStatus, jqxhr) {
				console.log( "loading app '"+app+"'" );
				console.log( textStatus ); // Success
				AppEngine.loadedApps.push(app);
				AppEngine.loadApp(app);
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

	loadApp : function(app){
		for(var i = 0 ; i < this.loadedApps.length; i++){
			if(this.loadedApps[i] == app){
				$('body').append('<div id="app'+app+'"></div>');
				$('#app'+app).app({ app: new window[app]() }).parents('.ui-dialog').draggable('option', 'snap', true);
				return;
			}
		}
		// App wasn't loaded before, getting the js
		this._loadAppJs(app);
	},

	loadPreset : function(preset){

	},

	savePreset : function(preset){

	},

	toggleEditmode : function(){

	}
};