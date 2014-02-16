$.widget( "beamNG.container", {
	options: {
		editMode: true,
		title: ""
	},
	components : {},
	_create: function() {
		this.element.addClass("bNG-container-content");

		this.components.container = $("<div class='bNG-container'><div></div></div>").appendTo($("body")).append(this.element);

		this.components.titlebar = $("<div class='bNG-container-titlebar'></div>").prependTo(this.components.container.children().first());


		this.components.title  = $("<div class='bNG-container-title'>"+this.options.title+"</div>").prependTo(this.components.titlebar);

		this.components.titlebuttons  = $("<div class='bNG-container-titlebuttons'></div>").appendTo(this.components.titlebar);

		this.components.optionbutton = $("<a href='' class='bNG-container-titlebutton'>O</a>").appendTo(this.components.titlebuttons);
		this.components.closebutton = $("<a href='' class='bNG-container-titlebutton'>X</a>").appendTo(this.components.titlebuttons);
		this._on(this.components.closebutton, {
			click:"close",
		});

		this.components.container.draggable({ handle: ".bNG-container-titlebar", stack: ".bNG-container" });
		this.components.container.resizable();
		this._on(this.components.container, {
			resize:"_resize",
		});

		this._setEditMode(this.options.editMode);
		this._resize();
	},
	_setEditMode: function(mode) {
		if(mode){
			this.components.container.addClass('bNG-container-edit');
		}else{
			this.components.container.removeClass('bNG-container-edit');
		}
	},
	_setOption: function(key, value) {
		if(key == "editMode"){
			this._setEditMode(value);
		}else if(key == "title"){
			this.components.title.html(value);
		}else if(key == "width"){
			this.components.container.width(value);
		}else if(key == "height"){
			this.components.container.height(value);
		}
		this._super(key, value);
	},
	_resize: function(){
		this.components.titlebar.outerWidth(this.element.outerWidth());
	},

	_destroy: function(){
		$.each(this.components,function(key, value){
			value.remove();
		});
	},

	close: function(){
		this.element.hide();
		this._destroy();
	}

});

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

		// Setting rootElement
		this.app.rootElement = $(this.element);

		// Initialize App
		this.app.initialize();

		// Register App
		AppEngine.registerApp(this.app);

		this._on(this.element.parent(), {
			resize:"resize",
		});

		$(this.element).parents('.ui-dialog').addClass("app");
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
			this._setEditMode(value);
		}
		this._super(key, value);
	},

	_setEditMode: function( value ){
		if(value){
			this.element.addClass('dialog-edit-content');
			this.dialogParent.children('.ui-dialog-titlebar').show();
		}else{
			this.element.removeClass('dialog-edit-content');
			this.dialogParent.children('.ui-dialog-titlebar').hide();
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
	appList : [],
	installedApps : [],
	loadedApps : [],
	editMode : false,
	preset : undefined,
	runningRequests : 0,

	initialize : function(){


		installedApps = ["Tacho","WheelsScreen","Tach", "Debug","Stats"]; // Call a beamNG function later

		$.ajaxPrefilter( function( options ) {
			options.crossDomain = true;
			options.cache = false;
		});

		// Load all apps
		for (var i = 0; i<installedApps.length;i++) {
			app = installedApps[i];
			this._loadAppJs(app,false);
		}

		// load persistance
		this._loadPersistance();

		AppEngine.loadPreset("default");

		//$('.ui-resizable-handle').addClass('.ui-resizable-disabled');
		//$( "div.ui-dialog" ).resizable('disable');

	},

	toggleEditMode: function() {
		this.editMode = !this.editMode;

		$.each(this.appList, function(index, app){
			app.rootElement.app("option", "editMode", AppEngine.editMode);
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
		installedApps = appList;
	},

	update : function(data){
		for(var j = 0; j<this.appList.length; j++){
			var app = this.appList[j];
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
		this.appList.push(app);
		//Adding streams
		for(var i=0; i<app.info.streams.length; i++){
			streamAdd(app.info.streams[i]);
		}
	},

	unregisterApp : function(app){
		this.appList.splice(this.appList.indexOf(app),1);
		// removing streams
		for(var i=0; i<app.info.streams.length; i++){
			streamRemove(app.info.streams[i]);
		}
	},

	loadApp : function(app, position, size){
		for(var i = 0 ; i < this.loadedApps.length; i++){
			if(this.loadedApps[i] == app){
				console.log("Adding app "+app+" to Screen");
				$('body').append('<div id="app'+app+'"></div>');
				var la = $('#app'+app).app({ app: new window[app]() });
				la.parents('.ui-dialog').draggable('option', 'snap', true);
//				la.parents('.ui-dialog').draggable('option', 'grid', [ 10, 10 ]);

				if(position !== undefined){
					$('#app'+app).app("option","position",position);
				}
				if(size !== undefined){
					console.log("size defined: "+size);
					$('#app'+app).app("option","width",size[0]);
					$('#app'+app).app("option","height",size[1]);
				}

				return;
			}
		}
		// App wasn't loaded before, getting the js
		this._loadAppJs(app,true,position,size);
	},

	loadPreset : function(preset){
		if(this.persistance.presets[preset] !== undefined){
			this.preset = preset;
			// preset exists :)
			console.log("loading preset '"+preset+"'");
			$.each(this.persistance.presets[preset], function(index, app) {
				AppEngine.loadApp(app.name, app.position, app.size);
			});
		}
	},

	savePreset : function(){

	},

	_loadPersistance : function(){
		if (localStorage.getItem("AppEngine") !== null) {
			this.persistance = JSON.parse(localStorage.getItem("AppEngine"));
			AppEngine.loadPreset("default");
		} else{
//			$.get('apps/default.json', undefined, function(data, textStatus, jqxhr) {
//				AppEngine.presets = JSON.parse(data);
//				AppEngine.loadPreset("default");
//			}, "script");
//			doesn't work (chrome bug), hardcoded for now:
			this.persistance = JSON.parse('{"presets":{"default":[{"name":"Tacho","position":[900,800],"size":[300,300]},{"name":"WheelsScreen","position":[30,200]},{"name":"Stats","position":[300,50]}]}}');
			this._savePersistance();
		}
	},

	_savePersistance : function(){
		localStorage.setItem("AppEngine",JSON.stringify(this.persistance));
	}
};

/*
Next Steps:

Overhaul Loading Process
- split in states
- make loading "syncronous"

Persistance
- Save app/position/size - chances

App-persistance
- Options for Apps

"Appstore"
- Gui to add apps

*/