// od - The object data
var objectData = {};

var state = {'changes':[], 'streams':{}};

var functionCallbacks = {};
var functionCallbackCounter = 0;

function oUpdate(v)
{
    objectData = v;

    AppEngine.update(v);
}

// beamng stub for the browser
if(typeof(beamng) === 'undefined') {
    function beamngEmulation() {
        this.sendGameEngine = function(s) {
                console.log("beamng.sendGameEngine('" + s + "')");
        };
        this.sendActiveObjectLua = function(s) {
                console.log("beamng.sendActiveObjectLua('" + s + "')");
        };
        this.sendSystemLua = function(s) {
                console.log("beamng.sendSystemLua('" + s + "')");
        };
    }

    beamng = new beamngEmulation();

    console.log("### BeamNG Emulation loaded ###");
}

/***********************************************************************************************/

function sendObjectState()
{
    var cmd = "guiUpdate(" + serializeToLua(state) + ")";
    //console.log(cmd);
    if(typeof beamng === 'object') {
        beamng.sendActiveObjectLua(cmd);
    } else {
        console.log(state);
        console.log(cmd);
    }

    state.changes = [];
    return true;
}

function sendCompleteObjectState()
{
    // if we want to send the full state, put everything into the changelist :)
    $.each(state, function(k) {
        if(k != 'changes')
            state.changes.push(k);
    });
    return sendObjectState();
}

function serializeToLua(obj)
{
    var tmp;
    if(obj === undefined) return ''; //nil';
    switch(obj.constructor) {
        case String:
            return '"' + obj + '"';
        case Number:
            return isFinite(obj) ? obj.toString() : null;
        case Boolean:
            return obj ? 'true' : 'false';
        case Array:
            tmp = [];
            for(var i = 0; i < obj.length; i++)
            {
                tmp.push(serializeToLua(obj[i]));
            }
            return '{' + tmp.join(',') + '}';
        default:
            if(typeof obj == "object")
            {
                tmp = [];
                for(var attr in obj)
                {
                    if(typeof obj[attr] != "function")
                        tmp.push('' + attr + '=' + serializeToLua(obj[attr]));
                }
                return '{' + tmp.join(',') + '}';
            } else {
                return obj.toString();
            }
    }
}

function streamAdd(streamName)
{
    if (state.streams[streamName]===undefined){
        state.streams[streamName] = 1;
    }else{
        state.streams[streamName] += 1;
    }
    state.changes.push('streams');
    sendObjectState();
//    console.log("Stream '"+streamName+"' added, Count: "+state.streams[streamName]);
//    console.log(JSON.stringify(state.streams));
}

function streamRemove(streamName)
{
    state.streams[streamName] -= 1;
    if (state.streams[streamName] < 0) {
        state.streams[streamName] = 0;
    }else{
        state.changes.push('streams');
        sendObjectState();
    }
//    console.log("Stream '"+streamName+"' removed, Count: "+state.streams[streamName]);
}


// listens on the collapsible events / unused at the moment
function collapsibleStreamEventHandler(name, streamName)
{
    if(streamName === undefined) streamName = name;
    var dataRole = $("#" + name).attr('data-role');
    if(dataRole == 'collapsible') {
        $("#" + name).collapsible({
            collapse: function() {
                streamRemove(streamName);
            },
            expand: function() {
                streamAdd(streamName);
            }
        });
    } else if(dataRole == 'panel') {
        $("#" + name).panel({
            open: function() {
                streamAdd(streamName);
            },
            close: function() {
                streamRemove(streamName);
            }
        });
    }
}

function updateGameEngineValue(key, value)
{
    beamng.sendGameEngine(key + "=" + value + ";");
}

function updateSingleValue(module, key, value)
{
    if(state[module] === undefined) {
        state[module] = {};
    }

    state[module][key] = value;

    state.changes.push(module);

    sendObjectState();
}

function callGameEngineFunc(func)
{
    beamng.sendGameEngine(func + "();");
}

function callGameEngineFuncArg(func, value)
{
    //console.log("callGameEngineFuncArg: " + func + "(" + value + ")");
    beamng.sendGameEngine(func + "(" + value + ");");
}

function callGameEngineFuncSprintfArg(func, value)
{
    var cmd = sprintf(func, value);
    //console.log("callGameEngineFuncSprintfArg: " + cmd);
    beamng.sendGameEngine(cmd);
}

function executeGameEngineCode(cmd)
{
    //console.log("executeGameEngineCode: " + cmd);
    beamng.sendGameEngine(cmd);
}

/*
* WARNING: only works with primitive datatypes as returnvalues OR with functions that return json. Never try to call a function which return a list/object/...
*/
function callGameEngineFuncCallback(func, callback)
{
    functionCallbackCounter++;
    functionCallbacks[functionCallbackCounter] = callback;
    var commandString = 'beamNGExecuteJS("_fCallback('+functionCallbackCounter+',\'" @ strreplace('+func+',"\'","\\\\\'") @ "\')",'+cefcontext+');';
    beamng.sendGameEngine(commandString);
}


function callLuaFuncCallback(func, callback)
{
    functionCallbackCounter++;
    functionCallbacks[functionCallbackCounter] = callback;
    var commandString = "gameEngine:executeJS('_fCallback("+functionCallbackCounter+",' .. encodeJson("+func+") ..')',"+cefcontext+")";
    beamng.sendActiveObjectLua(commandString);
}

function callSystemLuaFuncCallback(func, callback)
{
    functionCallbackCounter++;
    functionCallbacks[functionCallbackCounter] = callback;
    var commandString = "gameEngine:executeJS('_fCallback("+functionCallbackCounter+",' .. encodeJson("+func+") ..')',"+cefcontext+")";
    beamng.sendSystemLua(commandString);
}

function _fCallback(number, result)
{
	var res;
	try{
		res = JSON.parse(result);
	}catch(e){
		res = result;
	}
    functionCallbacks[number](res);
    functionCallbacks[number] = undefined;
}

function callLuaFunction(func, v)
{
    var cmd = func + '(' + v + ')';
    //console.log('callLuaFunction: ' + cmd);
    beamng.sendActiveObjectLua(cmd);
}

function callSystemLuaFunction(func, v)
{
    var cmd = func + '(' + v + ')';
    //console.log('callLuaFunction: ' + cmd);
    beamng.sendSystemLua(cmd);
}

function cefdev(v)
{
    if(v)
        $('.cefdev').css('visibility', 'visible');
    else
        $('.cefdev').css('visibility', 'hidden');
}
