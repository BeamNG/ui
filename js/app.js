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

		//$('.ui-resizable-handle').addClass('.ui-resizable-disabled');
		//$( "div.ui-dialog" ).resizable('disable');

	},

	toggleEditMode: function() {
		this.editMode = !this.editMode;

		$.each(this.appList, function(index, app){
			app.rootElement.app("option", "editMode", AppEngine.editMode);
		});
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
					if(state.streams[stream] == 1){
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

	loadApp : function(app){
		for(var i = 0 ; i < this.loadedApps.length; i++){
			if(this.loadedApps[i] == app){
				$('body').append('<div id="app'+app+'"></div>');
				var la = $('#app'+app).app({ app: new window[app]() });
				la.parents('.ui-dialog').draggable('option', 'snap', true);
//				la.parents('.ui-dialog').draggable('option', 'grid', [ 10, 10 ]);
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
};