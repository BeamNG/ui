var HookManager  = {
    hooksMap : {},
    hookArguments : {},
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
        var args = Array.prototype.slice.call(arguments, 1);
        this.hookArguments[hookName] = args;
//        this.log(hookName + '(' +  JSON.stringify(args) + ')');
        if(this.hooksMap[hookName] === undefined) {
            this.log('undefined hook triggered: ' + hookName);
            return;
        }
        $.each(this.hooksMap[hookName], function(k, v) {
            v[1].apply(v[0], args);
        });
    },
    getArguments : function(hookName){
        return this.hookArguments[hookName];
    },
    log: function(message){
        Logger.log("HookManager", message);
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