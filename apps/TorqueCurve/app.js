function TorqueCurve(){}

TorqueCurve.prototype.initialize = function(){
	this.plot = $.plot(this.rootElement, [
		{label:"Waiting for Data",data:[[0,0]]},
		],{
			legend: { position: "se" },
			xaxis: { min: 0 },
			yaxis: { min:0 },
			yaxes: [ {}, {position: "right"} ],
			crosshair: { mode: "x" }
		});
	this.plot.lockCrosshair({x:0});
};

TorqueCurve.prototype.update = function(streams){
	if(streams["torqueCurve"]!== undefined){
		this.log("tc streamupdate");
		this.torqueCurve = streams["torqueCurve"][0];
		this.powerCurve = streams["torqueCurve"][1];

		//build data for plot
		maxrpm = streams['engineInfo'][1];
		step = toInt(maxrpm / 50);
		torqueData = [];
		for (var i = 0; i < maxrpm; i+=step) {
			torqueData.push([i,this.torqueCurve[i]]);
		}
		torqueData.push([maxrpm,this.torqueCurve[maxrpm]]);
		
		powerData = [];
		for (var i = 0; i < maxrpm; i+=step) {
			powerData.push([i,this.powerCurve[i]]);
		}
		powerData.push([maxrpm,this.powerCurve[maxrpm]]);

		this.plot.setData([
			{label:"Torque",data:torqueData,color:"#38659D"},
			{label:"Power",data:powerData,color:"#E08E1B",yaxis:2}]);
		this.plot.setupGrid();
		this.plot.draw();
		$(".flot-y1-axis").css('text-shadow', '0 0 0.5px #38659D');
		$(".flot-y2-axis").css('text-shadow', '0 0 0.5px #E08E1B');
	}

	if(this.torqueCurve !== undefined){
		this.plot.setCrosshair({x:streams['engineInfo'][4]});
	}

};

TorqueCurve.prototype.resize = function(){};