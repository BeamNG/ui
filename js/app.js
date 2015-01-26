var nan = NaN;
$.widget( "beamNG.app", $.ui.dialog, {
    options: {
        app: null,
        persistance: undefined,
        active: true,
        editMode: false,
        refPointOffset : [0, 0],
        referencePoint : [0, 0], // [0,0] = upper left, [1,1] = lower right
        closeOnEscape : false
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
//            this.log("setting minsize");
            this.options.minHeight = Math.min(this.options.minHeight, this.options.height);
//            this.log(this.options.minHeight);
			// minimal height is 20
        	this.options.minHeight = Math.max(20, this.options.minHeight);
        	this.options.height = Math.max(20, this.options.height);
        }

        // minimal size is 20 px
        this.options.minWidth = Math.max(20, this.options.minWidth);
        this.options.width = Math.max(20, this.options.width);

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
        var backgroundClasses = ["opaque","opaque-simple","transparent",""];
        if(backgroundClasses.indexOf(this.appInfo.appearance.background)!= -1){
            this.element.addClass(this.appInfo.appearance.background);
        }else{
            this.log("Error parsing app.json attribute appearance.backround: invalid value");
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

        // adding optionspanel
        this.optionsPanel = $("<div></div>").css({
            position: 'absolute',
            bottom: 0,
            left: 0,
            right:0,
            display: 'none',
            background: 'rgba(200,200,200,0.5)'
        }).appendTo(this.element);

        this.oPanelOptions = {};
        this.oPanelOptions.hideInCockpit = $('<input type="checkbox" value="hideInCockpit">').appendTo(this.optionsPanel);
        $("<span>Hide in Cockpitview</span>").appendTo(this.optionsPanel);
        var self = this;
        this.cameraMode = AppEngine.cameraMode;
        this.oPanelOptions.hideInCockpit.click(function() {
            self.app.options.hideInCockpit = self.oPanelOptions.hideInCockpit.is(':checked');
            self.onCameraChange({'mode': self.cameraMode});
        });

        // adding logmethod
        var appname = this.appName;
        this.app.log = function(message){ Logger.log("App", message, appname); };

        // Initialize App
        try{
            this.app.initialize();
        }catch(e){
            this.log("An Error occured while trying to call "+this.app.name+".initialize() : "+e.stack+". Killing App.");
            var self = this;
            window.setTimeout(function(){self.close();},0);
        }

        // adding savemethod - this must be after initializing the apps, destorys preset otherwise
        this.app.save = function(){ AppEngine.savePreset(); };

        // installing handlers
        this._on(this.element.parent(), {
            resize:"resize",
            dragstart:"dragStart",
            drag:"drag",
            dragstop:"dragStop"
        });

        $(this.element).parents('.ui-dialog').addClass("ui-app");
        $(this.element).parents('.ui-dialog').removeClass('ui-corner-all');
        this.dialogParent = $(this.element).parents('.ui-dialog');
        this.dialogParent.draggable('option', 'snap', '.preset-'+AppEngine.preset+' .ui-app');
//        this.dialogParent.draggable('option', 'grid', [ 10, 10 ]);

        HookManager.registerAllHooks(this);
        this._setOption('editMode',AppEngine.editMode);
        this.element.trigger("resize");
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
            this.optionsPanel.show();
            // TODO: make options dynmic
            this.oPanelOptions.hideInCockpit.attr('checked', (this.app.options.hideInCockpit === true ));
        }else{
            this.element.removeClass('ui-app-editmode');
            this.dialogParent.children('.ui-dialog-titlebar').hide();
            this.dialogParent.children('.ui-resizable-handle').hide();
            this.optionsPanel.hide();
        }
    },

    close:function() {
        AppEngine.unregisterApp(this.app);

        if (typeof this.app.destroy === 'function') {
            try{
                this.app.destroy();
            }catch(e){
                this.log("An Error occured while trying to call "+this.app.name+".destroy() : "+e.stack);
            }
        }

        this._super();
        // unregistering Hooks
        HookManager.unregisterAll(this);
        // removing element
        this.element.remove();
    },

    resize: function(event) {
        event.stopPropagation();
        if (typeof this.app.resize === 'function') {
            try{
                this.app.resize();
            }catch(e){
                this.log("An Error occured while trying to call "+this.app.name+".resize() : "+e.stack);
            }
        }
    },
    dragStart: function(){
        RPIndicator.show(this.options.referencePoint);
    },
    drag: function(event,ui) {
        event.stopPropagation();
        var position = [ui.position.left,ui.position.top];
        var size = [this.element.width(), this.element.height()];
        var windowsize = [$(window).width(),$(window).height()];
        var border = 50;
        var change = false;
        // changing refpoint
        for (var i = 0; i < 2; i++) {
            if(position[i] < border && this.options.referencePoint[i] !== 0){
                this.options.referencePoint[i] = 0;
                change = true;
            }else if(position[i]+size[i]>=windowsize[i]-border && this.options.referencePoint[i] != 1){
                this.options.referencePoint[i] = 1;
                change = true;
            }
        }
        if(change){
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
//        this.log("calculateRefPointOffset()");
        var windowsize = [$(window).width(),$(window).height()];
        for (var i = 0; i < 2; i++) {
            this.options.refPointOffset[i] = this.options.position[i] - ( this.options.referencePoint[i] * windowsize[i] );
        }
    },
    calculatePosition: function(){
//        this.log("calculatePosition() offset: "+this.options.refPointOffset);
        var windowsize = [$(window).width(),$(window).height()];
        var position = [0,0];
        for (var i = 0; i < 2; i++) {
            position[i] = ( this.options.referencePoint[i] * windowsize[i] ) + this.options.refPointOffset[i];
        }
        this._setOption("position",position);
    },
    log: function(message){
        Logger.log("AppContainer",message,this.appName);
    },
    onEditmode: function(state){
        this._optionEditMode(state);
    },
    onCameraChange: function(args){
        this.cameraMode = args.mode;
        // assuming camera:0 = Cockpit
        if(this.app.options.hideInCockpit === true && args.mode === 0){
            this.app.rootElement.css('visibility','hidden');
            this.element.addClass('ui-app-hidden');
        }else{
            this.app.rootElement.css('visibility','visible');
            this.element.removeClass('ui-app-hidden');
        }
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
        this.element.hover(function() {
            $(this).children('.appButtonImage').first().stop(true, false).animate({height: 0}, 300);
        }, function() {
            $(this).children('.appButtonImage').first().stop(true, false).animate({height: 120}, 300);
        });

        this.element.click(function() {
            AppEngine.loadApp(appName);
            AppStore.close();
        });

    }
});

$(document).ready(function() {
//    console.log('getting Applist from Backend:');
    AppengineStartup();
});

function AppengineStartup(){
    if (cefcontext == -1){
        setTimeout("AppengineStartup()",50);
        return;
    }
    callGameEngineFuncCallback("getAppList()", function(res){
//        console.log('got: '+JSON.stringify(res));
        AppLoader.installedApps = res;
        AppLoader.initialize();
    });
}


// Appengine ------------------------------------------------------

var AppEngine = {
    runningApps : {},
    loadedApps : [],
    appSettings : {},
    editMode : false,
    preset : undefined,
    runningRequests : 0,
    presetPanel : {},
    initialized : false,
    cameraMode: -1,

    initialize : function() {
//        this.log("initializing AppEngine");
        // adding blendingdiv for editingmode
        this.backgroundblending = $("<div class='appengine-blending'></div>").hide().appendTo('body');

        this.backgroundblending.mousedown(function() {
            $(this).data('time',new Date());
        }).mouseup(function() {
            var oldtime = $(this).data('time');
            if(oldtime !== undefined){
//                console.log(new Date() - oldtime);
                if(new Date() - oldtime < 250){
                    if(AppEngine.editMode && !KeyManager.altpressed){
                        AppEngine.toggleEditMode();
                    }
                }

                $(this).removeData('time');
            }
        });

        // Install resizehandler
        $(window).resize(function(event) { AppEngine.resize(event); });

        // we want to make sure lua and html are in sync
        beamng.sendActiveObjectLua("streams.reset()");
        beamng.sendActiveObjectLua("hooks.reset()");

        // load persistance
        this._loadPersistance();

        // register Hooks
        HookManager.registerAllHooks(this);

        AppStore.initialize();
        DebugManager.initialize();

        this.initialized = true;
    },

    toggleEditMode: function() {
        this.editMode = !this.editMode;
        HookManager.trigger("Editmode",this.editMode);

        if (this.editMode) {
            $('.appengine-blending').stop(0,1).fadeIn(100);
        } else{
            $('.appengine-blending').stop(0,1).fadeOut(100);

            this.savePreset();
        }
    },

    update : function(data){
        if(this.initialized){
            for(var j = 0; j<this.runningApps[this.preset].length; j++){
                var app = this.runningApps[this.preset][j];
                var streamList = {};
                var streams = this.appSettings[app.name].data.streams;
                if(streams.length === 0){
                    continue;
                }
                var streamsReady = true;
                for(var i=0; i<streams.length; i++){
                    var stream = streams[i];
                    if(state.streams[stream] > 0 && data[stream] !== undefined){
                        streamList[stream] = data[stream];
                    }else{
                        streamsReady = false;
                    }
                }

                if(streamsReady){
                    try{
                        app.update(streamList);
                    }catch(e){
                        this.log("An Error occured while trying to call "+app.name+".update() : "+e.stack);
                    }
//                }else{
//                    this.log("A least one stream of "+app.name+" isn't not ready or non existing, no update.");
                }
            }
        }
    },

    registerApp : function(app){
        this.runningApps[this.preset].push(app);
        //Adding streams
        var streams = this.appSettings[app.name].data.streams;
        for(var i=0; i<streams.length; i++){
            streamAdd(streams[i]);
        }
        // adding hooks
        HookManager.registerAllHooks(app);
    },

    unregisterApp : function(app){
        this.runningApps[this.preset].splice(this.runningApps[this.preset].indexOf(app),1);
        // removing streams
        var streams = this.appSettings[app.name].data.streams;
        for(var i=0; i<streams.length; i++){
            streamRemove(streams[i]);
        }
        // removing hooks
        HookManager.unregisterAll(app);
    },

    loadApp : function(app, position, size, persistance){
        for(var i = 0 ; i < this.loadedApps.length; i++){
            if(this.loadedApps[i] == app){
                if(typeof window[app] !== 'function'){
                    this.log("App '"+app+"' can't be spawned. Appclass not found.");
                    return;
                }
                var appInstance = new window[app]();
//                this.log("Adding App "+app+" to Screen");
                var appElement = $('<div></div>').appendTo($('body'));
                appElement.app({ app: appInstance, "persistance" : persistance, appendTo : this.presetPanel[this.preset] });
                if(position !== undefined){
 //                   this.log("position:");
 //                   this.log(position[0]);
 //                   this.log(position[1]);
                    appElement.app("option","refPointOffset",position[1]);
                    appElement.app("option","referencePoint",position[0]);
                }else{
                    appElement.app("option","refPointOffset",[$(window).width()/3,$(window).height()/3]);
                    appElement.app("option","referencePoint",[0,0]);
                }
                if(size !== undefined){
//                    this.log("size defined: "+size);
                    size[0] = Math.max(size[0],20);
                    if(size[1] != "auto"){
                    	size[1] = Math.max(size[1],20);
                    }
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
        this.log("App "+app+" can't be displayed. A Error occurred while loading.");
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
//            this.log("Preset exists");

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
                this.presetPanel[preset] = $("<div class='preset-"+preset+"'></div>").appendTo($("body")).css({
                    width: "100%",
                    height: "100%"
                });

//                this.log("loading preset '"+preset+"'");
//                this.log("loading "+this.persistance.presets[preset].apps.length+" Apps:");
                $.each(this.persistance.presets[preset].apps, function(index, app) {
                    AppEngine.loadApp(app.name, app.position, app.size, app.persistance);

                });
//                this.log("done");
            }else{
                this.presetPanel[this.preset].fadeIn(250);
                $.each(this.runningApps[this.preset], function(index, app) {
                    app._widget.app("option","active",true);
                    app._widget.app("calculatePosition");
                });
            }

            HookManager.trigger('Message', {category: 'preset', msg: 'Preset: '+preset, ttl: 1});
        }
    },

    savePreset : function(){
        // empty Preset
        this.persistance.presets[this.preset].apps = [];
//        this.log("Saving Preset "+this.preset);
        $.each(this.runningApps[this.preset], function(index, app) {

            var appData = {};
            appData.name = app.constructor.name;
            appData.position = [app._widget.app("option","referencePoint"), app._widget.app("option","refPointOffset")];
            appData.size = [app._widget.app("option","width"),app._widget.app("option","height")];
            appData.persistance = { options : app.options, custom : app.persistance};

            // Don't save size if its unchanged or resizing is disallowed
            if (appData.size == AppEngine.appSettings[appData.name].appearance.size.initial || AppEngine.appSettings[appData.name].appearance.resize === false){
                appData.size = undefined;
            }

//            AppEngine.log("   -  "+JSON.stringify(appData));

            AppEngine.persistance.presets[AppEngine.preset].apps.push(appData);
        });

        this._savePersistance();

//        this.log("done.");
    },

    _loadPersistance : function(){
        if (window.localStorage.getItem("AppEngine") !== null) {
            var storageString = window.localStorage.getItem("AppEngine");
            this.persistance = JSON.parse(storageString);
//            this.log("LOADED CACHE: "+storageString);
            AppEngine.loadPreset("default");
        } else{
            $.getJSON('apps/persistance.json', function(data) {
//                AppEngine.log( "worked");
                AppEngine.persistance = data;
                AppEngine._savePersistance();
                window.location.reload();
            }).fail(function(jqxhr, textStatus, error) {
                AppEngine.log( "error "+error+" : "+textStatus );
            });
        }
    },

    _savePersistance : function(){
//        this.log("SAVING CACHE =======================================================================");
//        this.log("Contents: "+JSON.stringify(this.persistance));
        window.localStorage.setItem("AppEngine",JSON.stringify(this.persistance));
    },

    resize : function(){
        var windowsize = [$(window).width(),$(window).height()];
        $.each(this.runningApps[this.preset], function(index, app) {
            app._widget.app("calculatePosition");
            var position = app._widget.app("option","position");
            var size = [app._widget.app("option","width"),app._widget.app("option","height")];
            var change = 0;
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
    },
    log: function(message){
        Logger.log("AppEngine",message);
    },
    onCameraChange: function(args){
    	this.cameraMode = args.mode;
    }
};

var AppStore = {
    opened: false,
    initialize: function(){
//        Logger.log("AppStore","initializing AppStore");
        this.mainDiv = $("<div id='AppStore'></div>").appendTo("body");
        this.mainDiv.dialog({
            title: "Add User Interface App",
            width: $(window).width()-70,
            height: $(window).height()-70,
            beforeClose : function(){
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

        $(window).resize(function() {
            AppStore.resize();
        });

        HookManager.registerAllHooks(this);
    },
    open: function(){
        if(!AppEngine.editMode){
            AppEngine.toggleEditMode();
        }
        this.opened = true;
        this.mainDiv.parent().show();
        this.resize();
        this.mainDiv.dialog( "moveToTop" );
    },
    close: function(){
        this.mainDiv.parent().hide();
        this.opened = false;
    },
    resize: function(){
        this.mainDiv.dialog("option","width",$(window).width()-70);
        this.mainDiv.dialog("option","height",$(window).height()-70);
    },
    onEditmode: function(state){
        if(!state) {
            this.close();
        }
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
//        this.log("initializing Apploader");
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

        $.getScript( "apps/"+app+"/app.js", function() {
            AppLoader._setLoadState(app,'js',AppLoader.LOADSTATE.DONE);
        }).fail(function(){
            AppLoader._setLoadState(app,'js',AppLoader.LOADSTATE.ERROR);
            if(arguments[0].readyState === 0){
                //script failed to load
                this.log("app.js of '"+app+"' failed to load. Check your filenames.");
            }else{
                //script loaded but failed to parse
                this.log("app.js of '"+app+"' failed to parse: "+arguments[2].toString());
            }
        });
    },

    _loadAppJson : function(app){
        this._setLoadState(app,'json',this.LOADSTATE.LOADING);

        $.getJSON("apps/"+app+"/app.json", function(data) {
//            AppLoader.log(data);
            AppEngine.appSettings[app] = data;
            AppLoader._setLoadState(app,'json',AppLoader.LOADSTATE.DONE);

        }).fail(function(){
            AppLoader._setLoadState(app,'json',AppLoader.LOADSTATE.ERROR);
            AppLoader.log("app.json of '"+app+"' failed to load. Check your filenames.");
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
        //this.log(JSON.stringify(this.loadstates));
        var allLoaded = true;
        $.each(this.loadstates, function(appindex, app) {
            $.each(app, function(typeindex, state) {
                if(state == AppLoader.LOADSTATE.LOADING){ allLoaded=false; }
            });
        });
        //this.log("Progress ["+new Date().toLocaleTimeString()+"]: Status [LOADING/ERROR/DONE]: "+loading+"/"+error+"/"+done+" "+allLoaded);

        if(this.loadInitialized && allLoaded){
//            this.log("Loading done");
            $.each(this.loadstates, function(appindex, app) {
                if(app.js == AppLoader.LOADSTATE.DONE && app.json == AppLoader.LOADSTATE.DONE ){ // && app['data'] != AppLoader.LOADSTATE.LOADING
                    AppEngine.loadedApps.push(appindex);
                }
            });
//            this.log("loadedApps: "+JSON.stringify(AppEngine.loadedApps));
            AppEngine.initialize();
        }
    },
    log: function(message){
        Logger.log("AppLoader",message);
    }
};


var DebugManager = {
    presets: [],
    presetPosition: -1,
    initialized: false,
    initialize: function(){
        $.each(AppEngine.persistance.presets, function(index, preset) {
            if(preset.debug){
                DebugManager.presets.push(index);
            }
        });
//        this.log("Debugpresets: "+JSON.stringify(this.presets));
        this.initialized = true;
    },
    nextDebug: function(){
        if(this.initialized){
            this.presetPosition++;
            if(this.presetPosition == this.presets.length){
                this.presetPosition = -1;
            }
            this.updatePreset();
        }
    },
    previousDebug: function(){
        if(this.initialized){
            this.presetPosition--;
            if(this.presetPosition == -2){
                this.presetPosition = this.presets.length - 1;
            }
            this.updatePreset();            
        }
    },
    updatePreset: function(){
        if(this.presetPosition == -1){
            AppEngine.loadPreset("default");
            return;
        }
        AppEngine.loadPreset(this.presets[this.presetPosition]);
    },
    log: function(message){
        Logger.log("DebugManager",message);
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

var HelpManager = (function(){
    'use strict';
    var initialized = false;
    var helpState = 0;
    var helpImage;

    function init(){
        helpImage = $('<img />').hide().css({
            position: 'static',
            left: 10,
            top: 10
        }).appendTo($('body'));
        initialized = true;
    }

    function nextHelp(){
        if(!initialized){
            return;
        }
        helpState = (helpState+1)%3;
        if(helpState){
            helpImage.attr('src', 'images/beamnghelp'+helpState+'.png');
            if(helpImage.is(':hidden')){
                helpImage.fadeIn(250);
            }
        }else{
            helpImage.fadeOut(250);
        }
    }

    function onHelpToggle(){
        nextHelp();
    }

    // run init
    $(document).ready(function() {
        init();
    });
    // public interface
    var HelpManager = {
        onHelpToggle: onHelpToggle
    };
    // Register Hooks
    HookManager.registerAllHooks(HelpManager);
    return HelpManager;
})();

var KeyManager = {
    altpressed: false,
    initialize: function(){
        $(document).keyup(function(event) {
//            console.log("KEY: "+JSON.stringify(event.keyCode));
            var func = "ku"+event.keyCode;
            if(typeof(KeyManager[func]) == 'function'){
                KeyManager[func]({ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey});
            }
        });
        $(document).keydown(function(event) {
            var func = "kd"+event.keyCode;
            if(typeof(KeyManager[func]) == 'function'){
                KeyManager[func]({ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey});
            }            
        });
    },
    ku75: function(modifiers){ // K
        // Skeleton

        // activate Debug, if its deactivated
        if( !$('#debug_globalonoff').is(':checked')){
        	$('#debug_globalonoff').click();
        }
        var options = $('#skeleton_debug_options')
            .controlgroup( "container" )
            .find('input');
        var size = options.length;

        options.each(function(index){
            if($(this).is(':checked')){

                if(modifiers.shift){
                    index = index - 1;
                    if(index == -1) index = size - 1;
                }else{
                    index = (index + 1) % size;
                }

                options.get(index).click();
                var id = options.get(index).id;
                var name = $('label[for="'+id+'"]').text();
                HookManager.trigger('Message',{msg:'Skeleton: '+name, category:'debug',ttl: 2});
                return false;
            }
        });
    },
    ku76: function(modifiers){ // L

        // activate Debug, if its deactivated
        if( !$('#debug_globalonoff').is(':checked')){
        	$('#debug_globalonoff').click();
        }

        var options = $('#nodeinfo_debug_options')
            .find('option[data-placeholder!="true"]');
        var size = options.length;
        var found = false;
        var newIndex = 0;
        options.each(function(index){
            if($(this).is(':selected')){

                if(modifiers.shift){
                    newIndex = index - 1;
                    if(newIndex == -1) newIndex = size - 1;
                }else{
                    newIndex = (index + 1) % size;
                }

                found = true;
                return false;
            }
        });
        if(!found){
            if(modifiers.shift){
                    newIndex = size - 1;
                }else{
                    newIndex = 1;
                }
        }

        var name = options.get(newIndex).text;
        var value = options.get(newIndex).value;
//        console.log(name);
        $('#nodeinfo_debug_options').val(value).change().selectmenu('refresh');

        HookManager.trigger('Message',{msg:'Node Information: '+name, category:'debug',ttl: 2});
    },
    ku79: function(modifiers){ // O
        $('#debug_globalonoff').click();
        var state = $('#debug_globalonoff').is(':checked') ? 'enabled' : 'disabled';
        HookManager.trigger('Message',{msg:'Debug '+state, category:'debug',ttl: 2});
    },
    ku85: function(modifiers){ // U
        if(modifiers.ctrl){
            AppEngine.toggleEditMode();
        }
        if(modifiers.shift){
            $('body').toggleClass('hidden');
            if($('body').hasClass('hidden')){
                 document.body.style.cursor = 'none';
            }else{
                document.body.style.cursor = 'default';
            }
        }
    },
    ku187: function(modifiers){ // +
    	if(modifiers.shift){
    		var oldValue = $('#debug_mesh_visibility').val();
    		var newValue = Math.min((Math.floor(oldValue/20)+1)*20,100);
    		$('#debug_mesh_visibility').val(newValue).slider('refresh');
    		HookManager.trigger('Message',{msg:'Mesh Visibility changed to '+newValue+'%', category:'debug',ttl: 2});
    	}
    },
    ku189: function(modifiers){ // -
    	if(modifiers.shift){
    		var oldValue = $('#debug_mesh_visibility').val();
    		var newValue = Math.max((Math.ceil(oldValue/20)-1)*20,0);
    		$('#debug_mesh_visibility').val(newValue).slider('refresh');
    		HookManager.trigger('Message',{msg:'Mesh Visibility changed to '+newValue+'%', category:'debug',ttl: 2});
    	}
    },
    ku219: function(modifiers){ // [
        DebugManager.previousDebug();
    },
    ku221: function(modifiers){ // ]
        DebugManager.nextDebug();
    },
    ku32: function(modifiers){
        if (!actionmenu.isShown()) {
            actionmenu.show();
        } else {
            actionmenu.hide();
        }
    },
    ku27: function(modifiers){
        if (actionmenu.isShown()) {
            actionmenu.hide();
        } else {
            if (!dashboard.isShown()) {
                dashboard.showPanel();
            } else {
                if (!dashboard.restore()) {
                    dashboard.hidePanel();
                }
            }
        }
    },
    kd112: function(){
        HookManager.trigger('HelpToggle');
    }
/*	Removed until we find a way to check if the Application has the focus and
	prevent alt+tab triggering this
    kd18: function(){ // alt v
        if(!AppEngine.editMode){
            AppEngine.toggleEditMode();
        }
        this.altpressed = true;
    },
    ku18: function(){ // alt ^
        if(AppEngine.editMode && !AppStore.opened){
            AppEngine.toggleEditMode();
        }
        this.altpressed = false;
    }
    */

};
KeyManager.initialize();