function TorqueCurve(){
	this.info = {
		title: "TorqueCurve",
		preferredSize: [500,200],
		streams: ["torqueCurve", "engineInfo"]
	};
}

TorqueCurve.prototype.initialize = function(){
	$(this.rootElement).css('background-color', 'RGBA(255,255,255,0.9)');
	this.plotarea = $("<div></div>").css({
		height: '100%',
		width: '100%'
	}).appendTo(this.rootElement);

		this.plot = $.plot(this.plotarea, [
			{label:"Torque",data:[[0,0],[0.5,1]]},
			{label:"Power",data:[[0,0],[1,1]]}
			],{
				legend: { position: "se" },
				series: { shadowSize: 0 },
				xaxis: { min: 0 },
				yaxis: { min:0 },
				crosshair: { mode: "x" }
			});
		this.plot.lockCrosshair({x:0});
};

TorqueCurve.prototype.update = function(streams){
	if(streams["torqueCurve"]!== undefined){
		console.log(streams["torqueCurve"]);
		this.torqueCurve = streams["torqueCurve"][0];
		this.powerCurve = streams["torqueCurve"][1];

		//build data for plot
		maxrpm = streams['engineInfo'][1];
		step = toInt(maxrpm / 50);
		torqueData = [];
		for (var i = 0; i < maxrpm; i+=step) {
			torqueData.push([i,this.torqueCurve[i]]);
		};
		powerData = [];
		for (var i = 0; i < maxrpm; i+=step) {
			powerData.push([i,this.powerCurve[i]]);
		};

		this.plot.setData([{label:"Torque",data:torqueData},{label:"Power",data:powerData}]);
		this.plot.setupGrid();
		this.plot.draw();
	}
	

	if(this.torqueCurve !== undefined){
		this.plot.setCrosshair({x:streams['engineInfo'][4]});
	}
};

TorqueCurve.prototype.resize = function(){
	console.log("TorqueCurve resize");
};

function toInt(val){
	return val | 0;
}