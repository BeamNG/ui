$.widget( "beamNG.app", $.ui.dialog, {
	options: {
		app: null,
		persistance: undefined,
		active: true,
		editMode: false,
		refPointOffset : [0, 0],
		referencePoint : [0, 0] // [0,0] = upper left, [1,1] = lower right
	},

	_create : function(){
		this.app = this.options.app;
		this.appName = this.app.name = this.app.constructor.name;
		this.appInfo = AppEngine.appSettings[this.appName];

		// Persistance
		if(this.options.persistance === undefined){
			this.options.persistance = {
				options : {},
				custom : {}
			};
		}

		this.app.options = this.options.persistance.options;
		this.app.persistance = this.options.persistance.custom;

		// Configuration
		this.options.title = this.appInfo.info.name;

		// Resize
		if(this.appInfo.appearance.resize === false){
			this.options.resizable = false;
		}

		// inner size modifier
		var sizeOffset = 10 * ( this.appInfo.appearance.opaque === true);

		// Sizes
		if(this.appInfo.appearance.size.initial !== undefined){
			this.options.width = this.appInfo.appearance.size.initial[0] + sizeOffset;
			this.options.height =  this.appInfo.appearance.size.initial[1] + sizeOffset;
		}

		// minimal size
		if(this.appInfo.appearance.size.minimal !== undefined){
			this.options.minWidth = this.appInfo.appearance.size.minimal[0] + sizeOffset;
			this.options.minHeight = this.appInfo.appearance.size.minimal[1] + sizeOffset;
		}
		// minsize must be <= size
		this.options.minWidth = Math.min(this.options.minWidth, this.options.width);
		if(this.options.height != "auto"){
			console.log("setting minsize");
			this.options.minHeight = Math.min(this.options.minHeight, this.options.height);
			console.log(this.options.minHeight);
		}

		// maximal size
		if(this.appInfo.appearance.size.maximal !== undefined){
			this.options.maxWidth = this.appInfo.appearance.size.maximal[0] + sizeOffset;
			this.options.maxHeight = this.appInfo.appearance.size.maximal[1] + sizeOffset;
		}
		// maximal size must be >= size
		if(this.options.maxWidth){
			this.options.maxWidth = Math.max(this.options.maxWidth, this.options.width);
		}
		if(this.options.maxHeight){
			this.options.maxHeight = Math.max(this.options.maxHeight, this.options.height);
		}

		// add helpervariables

		this.app._widget = $(this.element);

		this.app.path = "apps/"+this.appName+"/";

		this._super();
	},

	_init:function(){

		//  Initialize Widget
		this._super("_init");


		// Background
		var backgroundClasses = ["opaque","opaque-simple","transparent"];
		if(backgroundClasses.indexOf(this.appInfo.appearance.background)!= -1){
			this.element.addClass(this.appInfo.appearance.background);
		}else{
			console.error("Error parsing app.json attribute appearance.backround: invalid value");
		}


		// adding properties
		this.element.addClass("app");

		this.app.rootElement = $("<div></div>").css({
			width: '100%',
			height: '100%',
			'min-width': '10px',
			'min-height': '10px'
		}).appendTo($(this.element));
		this.app.rootElement.addClass(this.appName);

		// adding savemethod
		this.app.save = function(){ AppEngine.savePreset(); };

		// Initialize App
		this.app.initialize();

		// installing handlers
		this._on(this.element.parent(), {
			resize:"resize",
			dragstart:"dragStart",
			drag:"drag",
			dragstop:"dragStop"
		});
		this._on($(window),{
			resize:"windowResize"
		});

		$(this.element).parents('.ui-dialog').addClass("ui-app");
		this.dialogParent = $(this.element).parents('.ui-dialog');
		this.dialogParent.draggable('option', 'snap', true);
//		this.dialogParent.draggable('option', 'grid', [ 10, 10 ]);

		this._setOption('editMode',AppEngine.editMode);
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
		}else if(key == "referencePoint"){
			this._super(key, value);
			this.calculatePosition();
		}else{
			this._super(key, value);
		}
	},

	_optionEditMode: function( value ){
		if(value){
			this.element.addClass('ui-app-editmode');
			this.dialogParent.children('.ui-dialog-titlebar').show();
			this.dialogParent.children('.ui-resizable-handle').show();
		}else{
			this.element.removeClass('ui-app-editmode');
			this.dialogParent.children('.ui-dialog-titlebar').hide();
			this.dialogParent.children('.ui-resizable-handle').hide();
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
	},
	dragStart: function(){
		RPIndicator.show(this.options.referencePoint);
	},
	drag: function(event,ui) {
		var position = [ui.position.left,ui.position.top];
		var size = [this.options.width, this.options.height];
		var windowsize = [$(window).width(),$(window).height()];
		var change = false;
		// changing refpoint
		for (var i = 0; i < 2; i++) {
			if(position[i] === 0 && this.options.referencePoint[i] == 1){
				this.options.referencePoint[i] = 0;
				change = true;
			}else if(position[i]+size[i]>=windowsize[i] && this.options.referencePoint[i] === 0){
				this.options.referencePoint[i] = 1;
				change = true;
			}
		}
		if(change){
			// now do some magic
			console.log("change");
			RPIndicator.move(this.options.referencePoint);
		}
	},
	dragStop: function(event,ui){
		this.options.position = [ui.position.left,ui.position.top]; // Updating position manually since the hook happens before changing the optionvalues
		this._calculateRefPointOffset();

		RPIndicator.hide();
	},
	windowResize: function(){
		if(this.options.active){
			this.calculatePosition();
			RPIndicator.move(this.options.referencePoint);
		}
	},
	_calculateRefPointOffset: function(){
		var windowsize = [$(window).width(),$(window).height()];
		for (var i = 0; i < 2; i++) {
			this.options.refPointOffset[i] = this.options.position[i] - ( this.options.referencePoint[i] * windowsize[i] );
		}
	},
	calculatePosition: function(){
		console.log("Repointoffset: "+this.options.refPointOffset);
		var windowsize = [$(window).width(),$(window).height()];
		var position = [0,0];
		for (var i = 0; i < 2; i++) {
			position[i] = ( this.options.referencePoint[i] * windowsize[i] ) + this.options.refPointOffset[i];
		}
		this._setOption("position",position);
	}

});

$.widget("beamNG.appButton", {
	_create : function(){
		var appName = this.options.app;
		this.appSettings = AppEngine.appSettings[appName];

		
		// creating the widget
		this.element.addClass('appButton');

		this.front = $("<div class='appButtonImage'></div>").appendTo(this.element);
		this.title = $("<div class='appButtonTitle'>"+this.appSettings.info.name+" <span class='appButtonSmall'>v"+this.appSettings.info.version+"</span></div>").appendTo(this.element);
		this.detail = $("<div class='appButtonInfo'></div>").appendTo(this.element);

		$("<div class='appButtonSmall'>by "+this.appSettings.info.author+"</div>").appendTo(this.detail);
		$("<div>"+this.appSettings.info.description+"</div>").appendTo(this.detail);

		this.front.css('background-image', 'url(apps/'+appName+'/app.png), url(images/appDefault.png)');

		// interactivity
		this.element.hover(function(obj) {
			$(this).children('.appButtonImage').first().stop(true, false).animate({height: 0}, 300);
		}, function() {
			$(this).children('.appButtonImage').first().stop(true, false).animate({height: 120}, 300);
		});

		this.element.click(function(event) {
			console.log();
			AppEngine.loadApp(appName);
			AppStore.close();
		});

	}
});

$(document).ready(function() {
	AppLoader.installedApps = ["Tacho","WheelsDebug", "Debug","NodeBeamDebug","EngineDebug","TorqueCurve","gForcesDebug","SimpleTacho","SimpleSpeedo","SimpleSteering","SimplePedals","SimpleDash","SimpleAGears","SimpleNBDebug","SimpleEngineDebug","SimpleRPMDebug","SimpleGears","SimpleDigSpeedo","SimpleDigTacho"]; // Call a beamNG function later
	AppLoader.initialize();
});


// Appengine ------------------------------------------------------

var AppEngine = {
	runningApps : {},
	loadedApps : [],
	appSettings : {},
	editMode : false,
	preset : undefined,
	runningRequests : 0,
	presetPanel : {},

	initialize : function(){
		// adding blendingdiv for editingmode
		$("<div id='appengine-blending'></div>").css({
			width: '100%',
			height: '100%',
			'background-color': 'rgba(0,0,0,0.5)',
			'z-index': '-250'
		}).hide().appendTo('body');

		// Install resizehandler
		$(window).resize(function(event) { AppEngine.resize(); });

		// load persistance
		this._loadPersistance();

		AppStore.initialize();
		DebugManager.initialize();
	},

	toggleEditMode: function() {
		this.editMode = !this.editMode;

		if (this.editMode) {
			$('#appengine-blending').show();
		} else{
			$('#appengine-blending').hide();
			
			AppStore.close();
			
			this.savePreset();
		}

		// changing appstates
		$.each(this.runningApps[AppEngine.preset], function(index, app){
			app._widget.app("option", "editMode", AppEngine.editMode);
		});
	},

	update : function(data){
		for(var j = 0; j<this.runningApps[this.preset].length; j++){
			var app = this.runningApps[this.preset][j];
			var streamList = {};
			var streams = this.appSettings[app.name].data.streams;
			for(var i=0; i<streams.length; i++){
				stream = streams[i];
					if(state.streams[stream] > 0){
						streamList[stream] = data[stream];
					}
				}
				app.update(streamList);
			}
		},

	registerApp : function(app){
		this.runningApps[this.preset].push(app);
		//Adding streams
		streams = this.appSettings[app.name].data.streams;
		for(var i=0; i<streams.length; i++){
			streamAdd(streams[i]);
		}
	},

	unregisterApp : function(app){
		this.runningApps[this.preset].splice(this.runningApps[this.preset].indexOf(app),1);
		// removing streams
		streams = this.appSettings[app.name].data.streams;
		for(var i=0; i<streams.length; i++){
			streamRemove(streams[i]);
		}
	},

	loadApp : function(app, position, size, persistance){
		for(var i = 0 ; i < this.loadedApps.length; i++){
			if(this.loadedApps[i] == app){
				if(typeof window[app] !== 'function'){
					console.error("App '"+app+"' can't be spawned. Appclass not found.");
					return;
				}
				appInstance = new window[app]();
				console.log("Adding app "+app+" to Screen");
				appElement = $('<div></div>').appendTo($('body'));
				appElement.app({ app: appInstance, "persistance" : persistance, appendTo : this.presetPanel[this.preset] });
				if(position !== undefined){
					console.log("position:");
					console.log(position[0]);
					console.log(position[1]);
					appElement.app("option","referencePoint",position[0]);
					appElement.app("option","refPointOffset",position[1]);
				}else{
					appElement.app("option","refPointOffset",[$(window).width()/3,$(window).height()/3]);
				}
				if(size !== undefined){
					console.log("size defined: "+size);
					appElement.app("option","width",size[0]);
					appElement.app("option","height",size[1]);
				}else{
					//heighthack :|
					appElement.app("option","height",this.appSettings[app].appearance.size.initial[1]);
				}

				this.registerApp(appInstance);

				return;
			}
		}
		console.error("App "+app+" can't be displayed. A Error occurred while loading.");
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

			if(this.presetPanel[this.preset] !== undefined){
				//desactivate old apps
				$.each(this.runningApps[this.preset], function(index, app) {
					app._widget.app("option","active",false);
				});
				//hide old preset
				this.presetPanel[this.preset].fadeOut(250);
			}

			this.preset = preset;
			

			if(this.runningApps[preset] === undefined){ // Preset wasn't loaded before
				this.runningApps[preset] = [];
				// creating presetpanel
				this.presetPanel[preset] = $("<div></div>").appendTo($("body")).css({
					width: "100%",
					height: "100%"
				});
				$("<span>"+preset+"</span>").appendTo(this.presetPanel[preset]);

				console.log("loading preset '"+preset+"'");
				$.each(this.persistance.presets[preset].apps, function(index, app) {
					AppEngine.loadApp(app.name, app.position, app.size, app.persistance);
				});
				this.resize();
				console.log("done");
			}else{
				this.presetPanel[this.preset].fadeIn(250);

				$.each(this.runningApps[this.preset], function(index, app) {
					app._widget.app("option","active",true);
					app._widget.app("calculatePosition");
				});
			}
		}
	},

	savePreset : function(){
		// empty Preset
		this.persistance.presets[this.preset].apps = [];
		console.log("Saving Preset "+this.preset);
		$.each(this.runningApps[this.preset], function(index, app) {
			
			appData = {};
			appData.name = app.constructor.name;
			appData.position = [app._widget.app("option","referencePoint"), app._widget.app("option","refPointOffset")];
			appData.size = [app._widget.app("option","width"),app._widget.app("option","height")];
			appData.persistance = { options : app.options, custom : app.persistance};

			// Don't save size if its unchanged or resizing is disallowed
			if (appData.size == AppEngine.appSettings[appData.name].appearance.size.initial || AppEngine.appSettings[appData.name].appearance.resize === false){
				appData.size = undefined;
			}

			console.log("   -  "+JSON.stringify(appData));

			AppEngine.persistance.presets[AppEngine.preset].apps.push(appData);
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
	},

	resize : function(){
		windowsize = [$(window).width(),$(window).height()];
		$.each(this.runningApps[this.preset], function(index, app) {
			position = app._widget.app("option","position");
			size = [app._widget.app("option","width"),app._widget.app("option","height")];
			change = 0;
			for (var i = 0; i < 2; i++) {
				if(position[i]+size[i] > windowsize[i]){
					change++;
					position[i] = windowsize[i] - size[i];
				}
			}
			if(change>0){
				app._widget.app("option","position",position);
			}

		});
	}
};

var AppStore = {
	initialize: function(){
		this.mainDiv = $("<div id='AppStore'></div>").appendTo("body");
		this.mainDiv.dialog({
			title: "Add App",
			width: $(window).width()-70,
			height: $(window).height()-70,
			beforeClose : function(event, ui){
				AppStore.close();
				return false;
			},
			draggable: false,
			resizable: false,
			closeOnEscape: true
		});
		this.close();

		$.each(AppEngine.loadedApps, function(index, val) {
			$("<a></a>").appendTo(AppStore.mainDiv).appButton({app: val});
		});

		$(window).resize(function(event) {
			AppStore.resize();
		});

		// button
		$("<a id='appstorebutton'>+</a>").appendTo($("#appengine-blending")).css({
			position: 'absolute',
			right: 50,
			top: 10
		}).button().click(function(event) {
			AppStore.open();
		});
	},
	open: function(){
		this.mainDiv.parent().show();
		this.resize();
		this.mainDiv.dialog( "moveToTop" );
	},
	close: function(){
		this.mainDiv.parent().hide();
	},
	resize: function(){
		this.mainDiv.dialog("option","width",$(window).width()-70);
		this.mainDiv.dialog("option","height",$(window).height()-70);
	}
};

var AppLoader = {
	installedApps : [],
	loadstates : {},
	loadInitialized : false,
	LOADSTATE : {
		DONE : 1,
		ERROR: -1,
		LOADING : 0
	},
	
	initialize: function(){
		console.log("Starting to load apps.");
		this.loadApps();
		this.loadInitialized = true;
		this._checkProgress();
	},

	loadApps : function(app){
		// Load all apps
		for (var i = 0; i<this.installedApps.length;i++) {
			app = this.installedApps[i];
			this._loadAppJs(app);
			this._loadAppJson(app);

			// load css
			var cssNode = document.createElement("link");
			cssNode.setAttribute("rel", "stylesheet");
			cssNode.setAttribute("type", "text/css");
			cssNode.setAttribute("href", "apps/"+app+"/app.css");
			$(cssNode).appendTo("head");
		}
	},

	_loadAppJs : function(app){
		this._setLoadState(app,'js',this.LOADSTATE.LOADING);
		
		$.getScript( "apps/"+app+"/app.js", function( data, textStatus, jqxhr) {
			AppLoader._setLoadState(app,'js',AppLoader.LOADSTATE.DONE);
		}).fail(function(){
			AppLoader._setLoadState(app,'js',AppLoader.LOADSTATE.ERROR);
			if(arguments[0].readyState === 0){
				//script failed to load
				console.error("app.js of '"+app+"' failed to load. Check your filenames.");
			}else{
				//script loaded but failed to parse
				console.error("app.js of '"+app+"' failed to parse: "+arguments[2].toString());
			}
		});
	},

	_loadAppJson : function(app){
		this._setLoadState(app,'json',this.LOADSTATE.LOADING);

		$.getJSON("apps/"+app+"/app.json", function(data) {
			console.log(data);
			AppEngine.appSettings[app] = data;
			AppLoader._setLoadState(app,'json',AppLoader.LOADSTATE.DONE);

		}).fail(function(){
			AppLoader._setLoadState(app,'json',AppLoader.LOADSTATE.ERROR);
			console.error("app.json of '"+app+"' failed to load. Check your filenames.");
		});
	},

	_setLoadState : function(app,type,state){
		if(this.loadstates[app] === undefined){
			this.loadstates[app] = {};
		}
		this.loadstates[app][type] = state;

		if(state == this.LOADSTATE.DONE || state == this.LOADSTATE.ERROR){
			this._checkProgress();
		}
	},

	_checkProgress : function(){
		//console.log(JSON.stringify(this.loadstates));
		allLoaded = true;
		$.each(this.loadstates, function(appindex, app) {
			$.each(app, function(typeindex, state) {
				if(state == AppLoader.LOADSTATE.LOADING){ allLoaded=false; }
			});
		});
		//console.log("Progress ["+new Date().toLocaleTimeString()+"]: Status [LOADING/ERROR/DONE]: "+loading+"/"+error+"/"+done+" "+allLoaded);

		if(this.loadInitialized && allLoaded){
			console.log("Loading done");
			$.each(this.loadstates, function(appindex, app) {
				if(app['js'] == AppLoader.LOADSTATE.DONE && app['json'] == AppLoader.LOADSTATE.DONE ){ // && app['data'] != AppLoader.LOADSTATE.LOADING
					AppEngine.loadedApps.push(appindex);
				}
			});
			console.log("loadedApps: "+JSON.stringify(AppEngine.loadedApps));
			AppEngine.initialize();
		}
	}
};

var HookManager  = {
	hooks : [],
	registerHook : function(object, methodname, hookname){
		this.hooks.push([object, methodname, hookname]);
	},
	unregisterHook : function(object){
		if(arguments[1]!==undefined){
			hookname = arguments[1];
			for(i = 0; i<this.hooks.length; i++){
				hook = this.hooks[i];
				if(hook[0] == object && hook[2] == hookname){
					this.hooks.splice(i,1);
				}
			}
		}else{
			for(i = 0; i<this.hooks.length; i++){
				hook = this.hooks[i];
				if(hook[0] == object){
					this.hooks.splice(i,1);
				}
			}
		}
	},
	triggerHook : function(hookname, data){
		console.log(hookname+" triggered");
		for(i = 0; i<this.hooks.length; i++){
			hook = this.hooks[i];
			if(hook[2] == hookname){
				object = hook[0];
				methodname = hook[1];
				object[methodname](data);
			}
		}
	},
	triggerHooks : function(hooks){
		for(i = 0; i<hooks.length; i++){
			this.triggerHook(hooks[i]);
		}
	}
};

var DebugManager = {
	presets: [],
	presetPosition: -1,
	initialize: function(){
		$.each(AppEngine.persistance.presets, function(index, preset) {
			if(preset.debug){
				DebugManager.presets.push(index);
			}
		});
		console.log("Debugpresets: "+JSON.stringify(this.presets));
		$(document).keyup(function(event) {
			console.log("KEY: "+JSON.stringify(event.which));
			if(event.which == 75){
				DebugManager.previousDebug();
			}else if(event.which == 76){
				DebugManager.nextDebug();
			}
		});
	},
	nextDebug: function(){
		this.presetPosition++;
		if(this.presetPosition == this.presets.length){
			this.presetPosition = -1;
		}
		this.updatePreset();
	},
	previousDebug: function(){
		this.presetPosition--;
		if(this.presetPosition == -2){
			this.presetPosition = this.presets.length - 1;
		}
		this.updatePreset();
	},
	updatePreset: function(){
		if(this.presetPosition == -1){
			AppEngine.loadPreset("default");
			return;
		}
		AppEngine.loadPreset(this.presets[this.presetPosition]);
	}
};


var RPIndicator = {
	size: 20,
	element: undefined,
	initialize: function(){
		this.element = $("<div class='RPIndicator'></div>").hide().appendTo($("body"));
	},
	show: function(position){
		if(this.element === undefined){ this.initialize(); }
		this.move(position);
		this.element.show();
	},
	move: function(position){
		if(this.element === undefined){ this.initialize(); }
		this.element.css({
			left: (position[0]*($(window).width()))-(this.size/2),
			top: (position[1]*($(window).height()))-(this.size/2)
		});
	},
	hide: function(){
		if(this.element === undefined){ this.initialize(); }
		this.element.hide();
	}
};

$(document).ready(function() {
	DebugKeySimulator.initialize();
});
var DebugKeySimulator = {
	initialize: function(){
		this.panel = $("<div></div>").appendTo($("body")).css({
			bottom: '0',
			left: '200px',
			position: 'absolute'
		});
		$("<a>&lt;</a>").appendTo(this.panel).button().click(function(event) {
			DebugManager.previousDebug();
		});
		$("<a>&gt;</a>").appendTo(this.panel).button().click(function(event) {
			DebugManager.nextDebug();
		});
	}
};