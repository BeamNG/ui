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
            this.log("setting minsize");
            this.options.minHeight = Math.min(this.options.minHeight, this.options.height);
            this.log(this.options.minHeight);
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

        // adding savemethod
        this.app.save = function(){ AppEngine.savePreset(); };
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
        
        HookManager.register('Editmode', this);
        this._setOption('editMode',AppEngine.editMode);
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
        this.log("calculateRefPointOffset()");
        var windowsize = [$(window).width(),$(window).height()];
        for (var i = 0; i < 2; i++) {
            this.options.refPointOffset[i] = this.options.position[i] - ( this.options.referencePoint[i] * windowsize[i] );
        }
    },
    calculatePosition: function(){
        this.log("calculatePosition() offset: "+this.options.refPointOffset);
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
    console.log('getting Applist from Backend:');
    callGameEngineFuncCallback("getAppList()", function(res){
        console.log('got: '+JSON.stringify(res));
        AppLoader.installedApps = res;
        AppLoader.initialize();
    });
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
    initialized : false,

    initialize : function() {
        this.log("initializing AppEngine");
        // adding blendingdiv for editingmode
        $("<div class='appengine-blending'></div>").hide().appendTo('body');

        // Install resizehandler
        $(window).resize(function(event) { AppEngine.resize(event); });

        beamng.sendGameEngine('vlua("streams.reset()");');

        // load persistance
        this._loadPersistance();

        AppStore.initialize();
        DebugManager.initialize();

        this.initialized = true;
    },

    toggleEditMode: function() {
        this.editMode = !this.editMode;
        HookManager.trigger("Editmode",this.editMode);

        if (this.editMode) {
            $('.appengine-blending').show();
        } else{
            $('.appengine-blending').hide();
            
            this.savePreset();
        }

        // changing appstates
 /*       $.each(this.runningApps, function(i, preset){
            $.each(preset, function(index, app){
                app._widget.app("option", "editMode", AppEngine.editMode);
            });
        });*/
    },

    update : function(data){
        if(this.initialized){
            for(var j = 0; j<this.runningApps[this.preset].length; j++){
                var app = this.runningApps[this.preset][j];
                var streamList = {};
                var streams = this.appSettings[app.name].data.streams;
                var streamsReady = true;
                for(var i=0; i<streams.length; i++){
                    var stream = streams[i];
                    if(state.streams[stream] > 0 && (data[stream] !== undefined || stream == "torqueCurve")){
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
                }else{
                    this.log("A least one stream of "+app.name+" isn't not ready or non existing, no update.");
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
                this.log("Adding app "+app+" to Screen");
                var appElement = $('<div></div>').appendTo($('body'));
                appElement.app({ app: appInstance, "persistance" : persistance, appendTo : this.presetPanel[this.preset] });
                if(position !== undefined){
                    this.log("position:");
                    this.log(position[0]);
                    this.log(position[1]);
                    appElement.app("option","refPointOffset",position[1]);
                    appElement.app("option","referencePoint",position[0]);
                }else{
                    appElement.app("option","refPointOffset",[$(window).width()/3,$(window).height()/3]);
                    appElement.app("option","referencePoint",[0,0]);
                }
                if(size !== undefined){
                    this.log("size defined: "+size);
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
            this.log("Preset exists");

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

                this.log("loading preset '"+preset+"'");
                $.each(this.persistance.presets[preset].apps, function(index, app) {
                    AppEngine.loadApp(app.name, app.position, app.size, app.persistance);

                });
                this.log("done");
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
        this.log("Saving Preset "+this.preset);
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

            AppEngine.log("   -  "+JSON.stringify(appData));

            AppEngine.persistance.presets[AppEngine.preset].apps.push(appData);
        });

        this._savePersistance();

        this.log("done.");
    },

    _loadPersistance : function(){
        if (window.localStorage.getItem("AppEngine") !== null) {
            this.persistance = JSON.parse(window.localStorage.getItem("AppEngine"));
            AppEngine.loadPreset("default");
        } else{
            $.getJSON('apps/persistance.json', function(data) {
                AppEngine.log( "worked");
                AppEngine.persistance = data;
                AppEngine._savePersistance();
                window.location.reload();
            }).fail(function(data) {
                AppEngine.log( "error" );
                AppEngine.log( JSON.stringify(data) );
            });
        }
    },

    _savePersistance : function(){
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
    }
};

var AppStore = {
    initialize: function(){
    	this.log("initializing AppStore");
        this.mainDiv = $("<div id='AppStore'></div>").appendTo("body");
        this.mainDiv.dialog({
            title: "Add App",
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

        // button
        this.storeButton = $("<a class='appstorebutton'>+</a>").appendTo($('body')).css({
            position: 'absolute',
            right: 50,
            top: 10,
            display: 'none'
        }).jquibutton().click(function() {
            AppStore.open();
        });
        
        HookManager.registerAllHooks(this);
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
    },
    onEditmode: function(state){
        if(state) {
            this.storeButton.show();
        } else {
            this.storeButton.hide();
            this.close();
        }
    },
    onHelpToggle: function(enabled) {
        // placeholder until we have sth better
        if(! $('#beamnghelp').length) {
            $("#mainpage").append('<div id="beamnghelp" style="margin:20px;"><img id="beamnghelpimg" src="images/beamnghelp1.png" /></div>');
            this.helpcounter = 0;
        }
        var display = true;
        this.helpcounter++;
        if(this.helpcounter > 2) {
            this.helpcounter = 0;
            display = false;
        }
        if(display)
            $('#beamnghelpimg').attr('src', 'images/beamnghelp'+this.helpcounter+'.png');
        $('#beamnghelp').css('display', (display == 1)?'block' : 'none');
    },

    onCameraChange: function() {
    },

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
        this.log("initializing Apploader");
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
            AppLoader.log(data);
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
            this.log("Loading done");
            $.each(this.loadstates, function(appindex, app) {
                if(app.js == AppLoader.LOADSTATE.DONE && app.json == AppLoader.LOADSTATE.DONE ){ // && app['data'] != AppLoader.LOADSTATE.LOADING
                    AppEngine.loadedApps.push(appindex);
                }
            });
            this.log("loadedApps: "+JSON.stringify(AppEngine.loadedApps));
            AppEngine.initialize();
        }
    },
    log: function(message){
        Logger.log("AppLoader",message);
    }
};

var HookManager  = {
    hooksMap : {},
    register : function(hookName, obj) {
        if(this.hooksMap[hookName] === undefined) {
            this.hooksMap[hookName] = [];
        }
        if(obj["on"+hookName] === undefined) {
            this.log("Error: registered for a hook but function is missing: " + hookName + ". Missing function: 'on"+hookName+"'");
            //this.log(obj);
            return;
        }
        this.hooksMap[hookName].push([obj, obj["on"+hookName]]);
    },
    registerAllHooks : function(obj) {
        //this.log('unregistering hook: ' + obj);
        for(var attr in obj) {
            if(typeof obj[attr] === "function" && attr.substring(0,2) == "on") {
                HookManager.register(attr.substring(2), obj);
            }
        }
    },
    unregister : function(hookName, obj) {
        //this.log('unregistering hook: ' + obj);
        if(this.hooksMap[hookName] === undefined || this.hooksMap[hookName].length === 0) {
            this.log('undefined hook unregistered: ' + hookName);
            return;
        }
        var hooks = this.hooksMap[hookName];
        for (var i = hooks.length - 1; i >= 0; i--) {
            if(hooks[i][0] == obj) {
                hooks.splice(i,1);
            }
        } 
    },
    unregisterAll: function(obj) {
        //this.log('unregistering object: ' + obj);
        $.each(this.hooksMap, function(index, hooks) {
            if(hooks.length > 0){
                for (var i = hooks.length - 1; i >= 0; i--) {
                    if(hooks[i][0] == obj){
                        hooks.splice(i,1);
                    }
                }
            }
        });
    },
    trigger : function(hookName){
        if(this.hooksMap[hookName] === undefined) {
            this.log('undefined hook triggered: ' + hookName);
            return;
        }
        var args = Array.prototype.slice.call(arguments, 1);
        this.log(hookName + '(' +  JSON.stringify(args) + ')');
        $.each(this.hooksMap[hookName], function(k, v) {
            v[1].apply(v[0], args);
        });
    },
    log: function(message){
        Logger.log("HookManager", message);
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
        this.log("Debugpresets: "+JSON.stringify(this.presets));
        $(document).keypress(function(event) {
            DebugManager.log("KEY: "+JSON.stringify(event.which));
            if(event.which == 107){
                DebugManager.previousDebug();
            }else if(event.which == 108){
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

var Logger = {
    log: function(system, message, instance){
        var logMessage = "["+system+"]";
        if(instance){
            logMessage += "["+instance+"]";
        }
        logMessage += ": "+message;
        window.console.log(logMessage);
    }
};