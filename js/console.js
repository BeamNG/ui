oldconsole = window.console

$(document).ready(function() {
	$("body").append("<div id='debugConsole'>Console<hr/><div id='consoleOutput'></div><div id='consoleInput'><input /></div><div id='consoleMinimize'>_</div></div><div id='consoleShow'>show Console</div>");

	$("head").append('<style> \
		#debugConsole, #consoleMinimize, #consoleShow { \
			background: white; \
		} \
		#debugConsole { \
			position: absolute; \
			bottom: 20px; \
			left: 2px; \
			border: 1px solid black; \
			font-family: monospace; \
			padding: 2px; \
		} \
		#debugConsole #consoleOutput { \
			overflow: auto; \
			max-width: 600px; \
			min-width: 400px; \
			max-height: 400px; \
		} \
		#debugConsole input { \
			border: none; \
			font-family: monospace; \
			border-bottom: 1px solid black; \
			width: 100%; \
		} \
		#consoleMinimize, #consoleShow { \
			border: 1px solid black; \
			display: inline; \
			position: absolute; \
			padding: 2px; \
		} \
		#consoleMinimize { \
			top : 2px; \
			right: 2px; \
		} \
		#consoleShow { \
			bottom : 20px; \
			left: 2px; \
			display: none; \
			font-family: monospace; \
		} \
		#consoleOutput .log { \
			border-left: 5px solid grey; \
			padding: 2px; \
		} \
		#consoleOutput .warn { \
			border-left: 5px solid orange; \
			padding: 2px; \
		} \
		#consoleOutput .error { \
			border-left: 5px solid red; \
			padding: 2px; \
		} \
		#consoleOutput .io { \
			border-left: 5px solid green; \
			padding: 2px; \
		} \
		</style>');

	$("#consoleMinimize, #consoleShow").click(function(event) {
		$("#debugConsole, #consoleShow").toggle();
	});

	$("#debugConsole input").keyup(function(event) {
		if(event.keyCode == 13){
			input = $("#debugConsole input").val();
			$("#debugConsole input").val('');
			console._addMessage("io",input);
			try{
				output = eval(input);
			}catch(error){
				console.error(error.name + ":" + error.message);
			}
			try{
				console._addMessage("io",">"+JSON.stringify(eval(input)));
			}catch(error){
				console._addMessage("io",">"+eval(input));
			}
		}
	});
});


console = {
	log : function(txt)
	{
		oldconsole.log(txt);
		this._addMessage("log",txt);
	},
	info : function(txt)
	{
		oldconsole.info(txt);
		this._addMessage("info",txt);
	},
	warn : function(txt)
	{
		oldconsole.warn(txt);
		this._addMessage("warn",txt);
	},
	error : function(txt)
	{
		oldconsole.error(txt);
		this._addMessage("error",txt);
	},
	_addMessage: function(cssClass, txt)
	{
		$("#consoleOutput").append("<div class='"+cssClass+"'>"+txt+"</div>");
		$('#consoleOutput').scrollTop($('#consoleOutput')[0].scrollHeight);
	}
}