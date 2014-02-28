$(document).ready(function() {
	__updateStreamDebug();
	__insertAppSpawn();
	__insertPresetChange();
});

function __updateStreamDebug(){
	debugstr = "";

	$.each(state.streams, function(index, val) {
		 debugstr += index + " ["+val+"]<br>";
	});


	$("#streamDebug").html(debugstr);
	setTimeout(function(){__updateStreamDebug();},200);
}

function __insertAppSpawn(){
	$.each(AppEngine.installedApps, function(index, app) {
		 $('<input type="button" value="'+app+'" onclick="AppEngine.loadApp(\''+app+'\');" />').appendTo($('#appdebug'));
	});
}

function __insertPresetChange(){
	$.each(AppEngine.persistance.presets, function(key, value) {
		 $('<input type="button" value="'+key+'" onclick="AppEngine.loadPreset(\''+key+'\');" />').appendTo($('#presetdebug'));
	});
}