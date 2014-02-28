oldconsole = window.console

$(document).ready(function() {
	$("#console").append("<div id='debugConsole'><div id='consoleOutput'></div><div id='consoleInput'><input /></div></div>");

	$("head").append('<style> \
		#debugConsole { \
			border: 1px solid black; \
			font-family: monospace; \
		} \
		#debugConsole #consoleOutput { \
			overflow: auto; \
			max-width: 600px; \
			max-height: 400px; \
		} \
		#debugConsole input { \
			border: none; \
			font-family: monospace; \
			border-bottom: 1px solid black; \
			width: 100%; \
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

	$("#debugConsole input").first().keyup(function(event) {
		if(event.keyCode == 13){ // Enter
			console._inputCounter = 0;
			input = $("#debugConsole input").val();
			console._inputs.push(input);
			$("#debugConsole input").val('');
			console._addMessage("io",input);
			var output;
			try{
				output = eval(input);

				try{
					console._addMessage("io",">"+JSON.stringify(output));
				}catch(error){
					console._addMessage("io",">"+output);
				}
			}catch(error){
				console.error(error.name + ":" + error.message);
			}
		}else if(event.keyCode == 38){ // arrow up
			console._inputCounter += 1;
			if (console._inputCounter > console._inputs.length){
				console._inputCounter = console._inputs.length;
			}
			$("#debugConsole input").val(console._inputs[console._inputs.length-console._inputCounter]);
		}else if(event.keyCode == 40){ // arrow down
			console._inputCounter -= 1;
			if(console._inputCounter <= 0){
				console._inputCounter = 0;
				$("#debugConsole input").val("");
			}else{
				$("#debugConsole input").val(console._inputs[console._inputs.length-console._inputCounter]);
			}
		}
	});
});


console = {
	_inputs : [],
	_inputCounter : 0,
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
		if(txt === undefined)
			txt = "undefined";
		if(txt === null)
			txt = "null";
		$("#consoleOutput").append("<div class='"+cssClass+"'>"+escapeHtml(txt.toString())+"</div>");
		$('#consoleOutput').scrollTop($('#consoleOutput')[0].scrollHeight);
	}
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }