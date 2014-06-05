// od - The object data
var objectData = {};

var state = {'changes':[], 'streams':{}};

var debugObjectData = false;

var sparkPoints = {};

var functionCallbacks = {};
var functionCallbackCounter = 0;

function oUpdate(v)
{
	objectData = v;

	AppEngine.update(v);
}

/***********************************************************************************************/

function sendObjectState()
{
	cmd = "guiUpdate(" + serializeToLua(state) + ")";
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
	$.each(state, function(k, v) {
		if(k != 'changes')
			state.changes.push(k);
	});
	return sendObjectState();
}

function serializeToLua(obj)
{
	if(obj === undefined) return ''; //nil';
	switch(obj.constructor) {
		case String:
			return '"' + obj + '"';
		case Number:
			return isFinite(obj) ? obj.toString() : null;
		case Boolean:
			return obj ? 'true' : 'false';
		case Array:
			var tmp = [];
			for(var i = 0; i < obj.length; i++)
			{
				tmp.push(serializeToLua(obj[i]));
			}
			return '{' + tmp.join(',') + '}';
		default:
			if(typeof obj == "object")
			{
				var tmp = [];
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
	console.log("Stream '"+streamName+"' added, Count: "+state.streams[streamName]);
	console.log(JSON.stringify(state.streams));
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
	console.log("Stream '"+streamName+"' removed, Count: "+state.streams[streamName]);
}


// listens on the collapsible events
function collapsibleStreamEventHandler(name, streamName)
{
	if(streamName === undefined) streamName = name;
	var dataRole = $("#" + name).attr('data-role');
	if(dataRole == 'collapsible') {
		$("#" + name).collapsible({
			collapse: function( event, ui ) {
				streamRemove(streamName);
			},
			expand: function( event, ui ) {
				streamAdd(streamName);
			}
		});
	} else if(dataRole == 'panel') {
		$("#" + name).panel({
			open: function( event, ui ) {
				streamAdd(streamName);
			},
			close: function( event, ui ) {
				streamRemove(streamName);
			}
		});
	}
}

function updateGameEngineValue(key, value)
{
	beamng.sendGameEngine(key + "=" + value + ";");
}

function callGameEngineFunc(func)
{
	beamng.sendGameEngine(func + "();");
}

/*
* WARNING: only works with primitive datatypes as returnvalues. Never try to call a function which return a list/object/...
*/
function callGameEngineFuncCallback(func, callback)
{
	functionCallbackCounter++;
	functionCallbacks[functionCallbackCounter] = callback;
	var commandString = 'beamNGExecuteJS("_fCallback('+functionCallbackCounter+', \'" @ strreplace('+func+',"\'","\\\\\'") @ "\')");';
	beamng.sendGameEngine(commandString);
}


function callLuaFuncCallback(func, callback)
{
	functionCallbackCounter++;
	functionCallbacks[functionCallbackCounter] = callback;
	var commandString = "gameEngine:executeJS('_fCallback("+functionCallbackCounter+", ' .. encodeJson("+func+") ..')')";
	beamng.sendActiveObjectLua(commandString);
}

function _fCallback(number, result)
{
	functionCallbacks[number](JSON.parse(result));
	functionCallbacks[number] = undefined;
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

// this function registers the controls and forwards changes to lua
function widgetEventHandler()
{
	// default args normally: func, widgetName, varname, ...
	var func = arguments[0];
	var widgetName = arguments[1];
	var funcArgs = Array.prototype.slice.call(arguments, 2);
	var c = $('#'+widgetName);
	var tagName = c.prop("tagName");
	if(tagName == 'INPUT') {
		var ctrlType = c.attr('data-type') || c.attr('type');
		if(ctrlType == 'checkbox') {
			c.change(function(e) {
				var funcArgsNow = funcArgs.slice(0);
				funcArgsNow.push($(this).is(':checked'));
				return func.apply(this, funcArgsNow);
			});
			return true;
		} else if(ctrlType == 'range') {
			c.change(function(e) {
				var funcArgsNow = funcArgs.slice(0);
				funcArgsNow.push($(this).val());
				return func.apply(this, funcArgsNow);
			});
			return true;
		} else if(ctrlType == 'button') {
			c.click(function(e) {
				return func.apply(this, funcArgs);
			});
			return true;
		}
	} else if(tagName == 'SELECT') {
		c.change(function(e) {
			var funcArgsNow = funcArgs.slice(0);
			funcArgsNow.push($(this).val());
			return func.apply(this, funcArgsNow);
		});
		return true;
	} else if(tagName == 'FIELDSET') {
		c = $('input[name='+widgetName+']');
		var ctrlType = c.attr('data-type') || c.attr('type');
		if(ctrlType == 'radio') {
			c.change(function(e) {
				var ctrl = $( 'input[name='+widgetName+']:checked' );
				var v = ctrl.val();
				if(ctrl.attr('value-is-numeric') !== undefined);
					v = +v;
				var funcArgsNow = funcArgs.slice(0);
				funcArgsNow.push(v);
				return func.apply(this, funcArgsNow);
			});
			return true;
		}
	}
	alert("control not bound: " + widgetName);
}



// ----ONLY FOR BROWSERTESTING---------------------------------------------------------------------------------------------------------
function test()
{
 oUpdate({"electrics":{"lowfuel":0,"american_taillight_L":0,"watertemp":0.4,"brake_input":0,"oiltemp":0.3,"parking":0,"driveshaft":98.314238955321,"signal_L":0,"signal_R":0,"reverse":0,"blinkPulse":0,"parkingbrake_input":0,"steering":-0,"clutch_input":0,"parkingbrake":0,"throttle_input":0,"lowhighbeam":0,"abs":0,"lowpressure":0,"rpm":537.72845438927,"checkengine":0,"gear_M":6.7532711376141e-035,"clutch":0,"gear_A":0.4,"american_taillight_R":0,"airspeed":1.2411048868436,"steering_input":7.61292,"altitude":0.35428247874325,"rpmspin":205.77032002941,"brake":0,"fuel":0.99887505956034,"lights":0,"axle":98.314238955321,"turnsignal":0,"throttle":0}, "vehicleInfo":[[["front",4,1,3,345,4,1],["back",4,1,3,345,4,1]],[500,7000,4000,1000,2456,3,5,1,43563,345,49,3,2,{},-9.81]]});
}