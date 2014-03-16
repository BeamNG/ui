$.widget( "beamNG.app", $.ui.dialog, {
	options: {
		app: null,
		editMode: false
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

		// adding properties
		this.app.rootElement = $("<div></div>").css({
			width: '100%',
			height: '100%'
		}).appendTo($(this.element));

		this.app._widget = $(this.element);

		this.app.path = "apps/"+this.app.constructor.name+"/";

		// Initialize App
		this.app.initialize();

		this._on(this.element.parent(), {
			resize:"resize",
		});

		$(this.element).parents('.ui-dialog').addClass("ui-app");
		this.dialogParent = $(this.element).parents('.ui-dialog');
	},
	_destroy:function() {
		this._super("_destroy");

		// unregister App
		AppEngine.unregisterApp(this.app);

		this.element.remove();
	},

	_setOption: function( key, value ) {
		if(key == "editMode"){
			this._optionEditMode(value);
		}else{
			this._super(key, value);
		}
	},

	_optionEditMode: function( value ){
		if(value){
			this.element.addClass('ui-app-editmode');
			this.dialogParent.children('.ui-dialog-titlebar').show();
//			this.dialogParent.children('.ui-resizable-handle').show();
		}else{
			this.element.removeClass('ui-app-editmode');
			this.dialogParent.children('.ui-dialog-titlebar').hide();
//			this.dialogParent.children('.ui-resizable-handle').hide();
		}
	},

	close:function() {
		AppEngine.unregisterApp(this.app);

		this._super();
	},

	resize: function() {
		if (typeof this.app.resize === 'function') {
			this.app.resize();
		}
	}

});

$(document).ready(function() {
	AppEngine.initialize();
});


// Appengine ------------------------------------------------------

var AppEngine = {
	runningApps : [],
	installedApps : [],
	loadedApps : [],
	editMode : false,
	preset : undefined,
	runningRequests : 0,

	initialize : function(){
		// adding blendingdiv for editingmode
		$("<div id='appengine-blending'></div>").css({
			width: '100%',
			height: '100%',
			'background-color': 'rgba(0,0,0,0.5)',
			'z-index': '-250'
		}).hide().appendTo('body');


		this.installedApps = ["Tacho","WheelsDebug","Tach", "Debug","NodeBeamDebug","EngineDebug","TorqueCurve","gForcesDebug"]; // Call a beamNG function later

		// Load all apps
		for (var i = 0; i<this.installedApps.length;i++) {
			app = this.installedApps[i];
			this._loadAppJs(app,false);
		}

		// load persistance
		this._loadPersistance();

//		AppStore.initialize();
	},

	toggleEditMode: function() {
		this.editMode = !this.editMode;

		// backgroundoverlay
		if (this.editMode) {
			$('#appengine-blending').show();
		} else{
			$('#appengine-blending').hide();
		}

		if (!(this.editMode)){
			// Saving preset
			this.savePreset();
		}

		// changing appstates
		$.each(this.runningApps, function(index, app){
			app._widget.app("option", "editMode", AppEngine.editMode);
		});
	},

	_loadAppJs : function(app,load,position,size){
			$.getScript( "apps/"+app+"/"+app+".js", function( data, textStatus, jqxhr) {
				AppEngine.loadedApps.push(app);
				if(load === true){
					AppEngine.loadApp(app,position,size);
				}
			});
	},

	_setInstalledApps : function(appList){
		this.installedApps = appList;
	},

	update : function(data){
		for(var j = 0; j<this.runningApps.length; j++){
			var app = this.runningApps[j];
			var streamList = {};
			for(var i=0; i<app.info.streams.length; i++){
				stream = app.info.streams[i];
					if(state.streams[stream] > 0){
						streamList[stream] = data[stream];
					}
				}
				app.update(streamList);
			}
		},

	registerApp : function(app){
		this.runningApps.push(app);
		//Adding streams
		for(var i=0; i<app.info.streams.length; i++){
			streamAdd(app.info.streams[i]);
		}
	},

	unregisterApp : function(app){
		this.runningApps.splice(this.runningApps.indexOf(app),1);
		// removing streams
		for(var i=0; i<app.info.streams.length; i++){
			streamRemove(app.info.streams[i]);
		}
	},

	loadApp : function(app, position, size){
		for(var i = 0 ; i < this.loadedApps.length; i++){
			if(this.loadedApps[i] == app){
				appInstance = new window[app]();
				console.log("Adding app "+app+" to Screen");
				appElement = $('<div class="app '+app+'"></div>').appendTo($('body'));
				appElement.app({ app: appInstance });
				appElement.parents('.ui-dialog').draggable('option', 'snap', true);
//				appElement.parents('.ui-dialog').draggable('option', 'grid', [ 10, 10 ]);
				if(position !== undefined){
					appElement.app("option","position",position);
				}else{
					appElement.app("option","position",[$(window).width()/3,$(window).height()/3]);
				}
				if(size !== undefined){
					console.log("size defined: "+size);
					appElement.app("option","width",size[0]);
					appElement.app("option","height",size[1]);
				}

				this.registerApp(appInstance);

				return;
			}
		}
		// App wasn't loaded before, getting the js
		this._loadAppJs(app,true,position,size);
	},

	addPreset : function(preset){
		this.persistance.presets[preset] = {};
	},

	deletePreset : function(preset){
		if(typeof this.persistance.presets[preset] !== undefined){
			this.persistance.presets[preset] = undefined;
		}
	},

	loadPreset : function(preset){
		if(this.persistance.presets[preset] !== undefined){
			console.log("Preset exists");
			this.preset = preset;
			// preset exists :)

			// destroying old apps
			console.log("destroying old apps");
			$.each(this.runningApps, function(index, app) {
				app._widget.app("close");
			});
			console.log("done");
			console.log("loading preset '"+preset+"'");
			$.each(this.persistance.presets[preset], function(index, app) {
				AppEngine.loadApp(app.name, app.position, app.size);
			});
			console.log("done");
		}
	},

	savePreset : function(){
		// empty Preset
		this.persistance.presets[this.preset] = [];
		console.log("Saving Preset "+this.preset);
		$.each(this.runningApps, function(index, app) {
			
			appData = {};
			appData.name = app.constructor.name;
			appData.position = app._widget.app("option","position");
			appData.size = [app._widget.app("option","width"),app._widget.app("option","height")];

			console.log("   -  "+JSON.stringify(appData));


			AppEngine.persistance.presets[AppEngine.preset].push(appData);
		});

		this._savePersistance();

		console.log("done.");
	},

	_loadPersistance : function(){
		if (localStorage.getItem("AppEngine") !== null) {
			this.persistance = JSON.parse(localStorage.getItem("AppEngine"));
			AppEngine.loadPreset("default");
		} else{
			$.getJSON('apps/persistance.json', function(data) {
				console.log( "worked");
				AppEngine.persistance = data;
				AppEngine._savePersistance();
				AppEngine.loadPreset("default");
			}).fail(function(data) {
				console.log( "error" );
				console.log( JSON.stringify(data) );
			});
		}
	},

	_savePersistance : function(){
		localStorage.setItem("AppEngine",JSON.stringify(this.persistance));
	}
};

var AppStore = {
	initialize: function(){
		this.mainDiv = $("<div id='AppStore'>Teeeeeeeeeeest</div>").css({
			width: '80%',
			height: '80%',
			
		});appendTo("body");
	}
};