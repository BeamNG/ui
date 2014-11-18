function ForceFeedback(){}

ForceFeedback.prototype.initialize = function(){
    this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);
    this.canvas[0].width = 300;
    this.canvas[0].height = 50;

    this.scale = 1;
    this.noFFB = false;

    var c = this.canvas[0];
    var ctx  = c.getContext('2d');
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
};

ForceFeedback.prototype.update = function(streams){
    if(!streams.sensors.ffb || this.noFFB){
        streams.sensors.ffb = Math.random()*100 - 50;
        this.noFFB = true;
    }
    
    var c = this.canvas[0];
    var ctx  = c.getContext('2d');

    ctx.fillStyle="black";
    ctx.fillRect(0,0,300,50);
    ctx.fillStyle="gray";
    ctx.fillRect(5,5,290,40);

    if(streams.sensors.ffb){
        var force = streams.sensors.ffb;
        if(Math.abs(force)>this.scale){
            this.scale = Math.abs(force);
        }
    
        ctx.fillStyle = "blue";
        ctx.fillRect(145,5,(force/this.scale)*145,40);

        ctx.fillStyle = "lightgrey";
        var txt = force.toFixed(2);
        ctx.fillText(txt,145,25);  
    }
};

ForceFeedback.prototype.onVehicleChange = function(){
    this.scale = 1;
};
