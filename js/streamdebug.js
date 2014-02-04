$(document).ready(function() {
	$("<div id='streamDebug'></div>").appendTo($('body')).css({
		position: 'absolute',
		left: '40px',
		top: '5px',
		background: 'white'
	});
	__updateStreamDebug();
});

function __updateStreamDebug(){
	debugstr = "<b>Streams:</b><br>";

	$.each(state.streams, function(index, val) {
		 debugstr += index + " ["+val+"]<br>";
	});


	$("#streamDebug").html(debugstr);
	setTimeout(function(){__updateStreamDebug();},200);
}