function ForceFeedbackGraph(){}

ForceFeedbackGraph.prototype.initialize = function(){
    this.Datapoints = 100;
    this.max = 1;
    this.ffbData = [];
    this.steeringData = [];
    for (var i = 0; i < this.Datapoints; i++) {
        this.ffbData[i] = 0;
        this.steeringData[i] = 0;
    }
    this.plotContainer = $('<div style="position: absolute; top: 0; left:0; right: 0; bottom: 25px;"></div>').appendTo(this.rootElement);
    this.plot = this.plot = $.plot(this.plotContainer,[this.generateData(this.ffbData),this.generateData(this.steeringData)],{
        series: {
            shadowSize: 0
        },
        yaxes: [
            {
                min: -1,
                max: 1,
                show: false             
            },
            {
                min: -this.max,
                max: this.max
            }
        ],
        xaxis:{
            show: false,
            min: 0,
            max: this.Datapoints
        },
        legend: {
            position: "sw"
        }
    });
    this.bottomContainer = $('<div style="position: absolute; left:0; right: 0; bottom: 0; height: 25px"></div>').appendTo(this.rootElement);
    var self = this;
    this.DatapointField = $('<input type="range" min="50" max="500" value="100" step="10" tabindex="0" />').appendTo(this.bottomContainer).change(function(){
        self.changeDatapoints($(this).val());
    });
    this.bottomContainer.append('Datapoints: ');
    this.DataPointLabel = $('<span>100</span>').appendTo(this.bottomContainer);
};

ForceFeedbackGraph.prototype.generateData = function(data){
    var graphData = [];
    for (var i = 0; i < this.Datapoints; i++) {
        graphData[i] = [i,data[i]];
    }
    return graphData;
};

ForceFeedbackGraph.prototype.changeDatapoints = function(value){
    //console.log(value);
    var self = this;
    $.each(['ffbData','steeringData'], function(i,v){
        if(value > self.Datapoints){
            var diff = value - self.Datapoints;
            //console.log(diff);
            for(var i = 0; i < diff; i++){
                self[v].unshift(0);
            }
        }else{
            self[v] = _.last(self[v],value);
        }
        console.log(v+":"+self[v].length);
    });
    self.Datapoints = value;
    self.DataPointLabel.text(value);
    this.plot.getOptions().xaxes[0].max = value;
    self.plot.setupGrid();
};

ForceFeedbackGraph.prototype.update = function(streams){
    if(Math.abs(streams.sensors.ffb)>this.max){
        this.max = Math.ceil(Math.abs(streams.sensors.ffb));
        this.plot.getOptions().yaxes[1].min = -this.max;
        this.plot.getOptions().yaxes[1].max = this.max;
        this.plot.setupGrid();
    }
    this.ffbData.push(streams.sensors.ffb);
    this.ffbData.shift();

    this.steeringData.push(streams.electrics.steering_input);
    this.steeringData.shift();
    this.plot.setData([
        {label:"Steering",data:this.generateData(this.steeringData),color:"#A30000"},
        {label:"ForceFeedback",data:this.generateData(this.ffbData),color:"#38659D", yaxis: 2}
    ]);
    this.plot.draw();
};

ForceFeedbackGraph.prototype.onVehicleChange = function(){
    this.max = 1;
    
};
