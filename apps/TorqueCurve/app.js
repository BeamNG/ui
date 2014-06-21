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
    if(streams.torqueCurve!== undefined){
        this.log("tc streamupdate");
        this.torqueCurve = streams.torqueCurve[0];
        this.powerCurve = streams.torqueCurve[1];

        //build data for plot
        var maxrpm = streams.engineInfo[1];
        var step = toInt(maxrpm / 50);
        var torqueData = [];
        for (var i = 0; i < maxrpm; i+=step) {
            torqueData.push([i,this.torqueCurve[i]]);
        }
        torqueData.push([maxrpm,this.torqueCurve[maxrpm]]);

        var powerData = [];
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

        // change legend
        this.rootElement.find(".legend").children('table').css('width', 150);
        this.rootElement.find(".legend").children('div').css('width', 150);
        this.rootElement.find('.legendLabel').each(function(index, el) {
            $(el).css({
                'text-align': 'right',
                width: 130
            });
        });

    }

    if(this.torqueCurve !== undefined){
        this.plot.setCrosshair({x:streams.engineInfo[4]});
        var legends = this.rootElement.find('.legendLabel');
        var rpm = toInt(streams.engineInfo[4]);
        var currentTorque = this.torqueCurve[rpm];
        var currentPower = this.powerCurve[rpm];
        legends.eq(0).text("Torque: " + (currentTorque*streams.electrics.throttle).toFixed(0) + "/" +currentTorque.toFixed(0)+ " N m");
        legends.eq(1).text("Power: " + (currentPower*streams.electrics.throttle).toFixed(0) + "/"+ currentPower.toFixed(0)+ " hp");
    }

};
