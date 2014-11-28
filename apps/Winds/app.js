function Winds() {}

Winds.prototype.initialize = function () {
	this.maxSpeed = 250;
	this.wSpeedOld = 0;
	this.wSpeed = 0;

	this.degOld = 0;
	this.deg = 0;

	this.units = [['m/s',1,2], ['kts',0.51444,5], ['km/h',0.27778,10], ['mph',0.44704,5]];

	this.updateNeeded = true;
	
	if(this.persistance.Unit==null){this.persistance.Unit = 0};
	
	this.topContainer = $('<div style="position: absolute; top: 0; left:0; right: 0; bottom: 25px;"></div>').appendTo(this.rootElement);
	this.bottomContainer = $('<div style="position: absolute; left:0; right: 0; bottom: 0; height: 25px; margin-bottom:5px"></div>').appendTo(this.rootElement);

	this.circle = $('<div></div>').appendTo(this.topContainer).addClass('circle');
	this.arrow = $('<div></div>').appendTo(this.topContainer).addClass('arrow-up');
	
	this.handler = $('<div></div>').appendTo(this.topContainer).addClass('handler');
	this.handler.text( "180º" );
	
    this.labelWS = $('<div></div>').appendTo(this.bottomContainer).addClass('labelWS');
	this.labelWS.html('<span style="color:#333;font-size:20px;font-weight:bold">0</span> ' + this.units[this.persistance.Unit][0]);
	
	this.handlerW2 = this.handler.width()/2,
	this.rad = this.circle.width()/2,
	
	this.X = 0,
	this.Y = -this.rad,
	
	this.handler.css({left:this.X, top:this.Y});
	
	this.firsttime = true;
	
	this.mHold = 0,
	this.PI2 = Math.PI/180;
	
    this.loaded = false;
	
	this.mHold = false;
	
	this.handler.mousedown(function(){self.holdOn();});
	this.rootElement.mouseup(function(){self.holdOff();});
	
    var self = this;
	this.rootElement.mousemove(function(e){self.moving(e);});
	
	this.rangeWS = $('<input style="position:absolute;width:150px;margin-left:15px;top:5px" type="range" min="0" max="' + this.maxSpeed/this.units[this.persistance.Unit][1] + '" value="' + this.wSpeed +'" step="' + this.units[this.persistance.Unit][2] + '" tabindex="-1" />').appendTo(this.bottomContainer).mousedown(function(){this.rangeClick=true;}).mouseup(function(){this.rangeClick=true;}).mousemove(function(){
		if(this.rangeClick){
			self.changeWSpeed($(this).val());
		}
    }).change(function(){
		this.rangeClick=false;
	});
	
	this.labelWS.on('click', function() {self.toggleUnits();} );
	
};

Winds.prototype.changeWSpeed = function(value){
	this.rangeWS.blur();
	this.wSpeed = value * this.units[this.persistance.Unit][1];
	this.labelWS.html('<span style="color:#333;font-size:20px;font-weight:bold">'+value+'</span> ' + this.units[this.persistance.Unit][0]);
	this.rangeWS.css({ 
			'background-color': "hsla(32, 93%, 50%," + (this.wSpeed*1/this.maxSpeed)+")"
	});
	//this.send();
	if(this.wSpeed != this.wSpeedOld){
		this.wSpeedOld = this.wSpeed;
		this.updateNeeded = true;
	}
};

Winds.prototype.holdOn = function(){
	this.mHold = true;	
};

Winds.prototype.holdOff = function(){
	this.mHold = false;
};

Winds.prototype.moving = function(e){
	if(this.mHold){
		this.mPos = {x:e.pageX-this.elPos.x, y:e.pageY-this.elPos.y};
		this.atan = Math.atan2(this.mPos.x-this.rad, this.mPos.y-this.rad);
		this.deg  = -this.atan/this.PI2+180;
		this.perc = (this.deg*100/360)|0;
		
		this.X = Math.round(this.rad*  Math.sin(this.deg*this.PI2));    
		this.Y = Math.round(this.rad* -Math.cos(this.deg*this.PI2));
		
		this.handler.css({ 
			left:this.X-this.handlerW2+this.rootElement.width()/2,
			top:this.Y+this.rad-this.handlerW2+Number(this.circle.css('marginTop').replace('px','')),
			transform: 'rotate('+this.deg+'deg)'
		});
		
		var degT = this.deg+180;
		if (degT>360){degT=degT-360;}
		
		this.handler.text( (degT|0) + "º");
		
		if(this.deg != this.degOld){
			this.degOld = this.deg;
			this.updateNeeded = true;
		}
	}
	
};

Winds.prototype.send = function(){
	if(this.updateNeeded){
		//this.log("Setting Wind");
		this.cx = Math.sin(this.deg*this.PI2)*this.wSpeed;
		this.cy = Math.cos(this.deg*this.PI2)*this.wSpeed;
		beamng.sendActiveObjectLua("obj:setWind("+this.cx+", "+this.cy+", 0)");
		this.updateNeeded = false;
	}
};

Winds.prototype.onEditmode = function(enabled) {
	this.editing=enabled;
};

Winds.prototype.update = function (streams) {

	if(this.editing||this.firsttime){
		this.offs = this.rootElement.offset(),
		this.elPos = {x:this.offs.left+this.rootElement.width()/2-this.rad, y:this.offs.top+Number(this.circle.css('marginTop').replace('px',''))}
		this.firsttime=false;
	}
	
	this.send();

	var yaw = streams.sensors.yaw;
	this.arrow.css({ 
			transform: 'rotate('+(-yaw)+'rad)',
			'transform-origin': '50% 70%'
	});
};

Winds.prototype.resize = function () {
	this.handler.css({left:this.X-this.handlerW2+this.rootElement.width()/2, top:this.Y+this.rad-this.handlerW2+Number(this.circle.css('marginTop').replace('px','')), transform:'rotate('+this.deg+'deg)'});
};

Winds.prototype.toggleUnits = function(){
    this.persistance.Unit = this.persistance.Unit + 1;
	if(this.persistance.Unit==this.units.length){this.persistance.Unit=0;}
	this.rangeWS.remove();
	
	var newV = this.wSpeed / this.units[this.persistance.Unit][1];
	this.labelWS.html('<span style="color:#333;font-size:20px;font-weight:bold">' + Math.round(newV) + '</span> ' + this.units[this.persistance.Unit][0]);
	var self = this;
	this.rangeWS = $('<input style="position:absolute;width:150px;margin-left:15px;top:5px" type="range" min="0" max="' + this.maxSpeed/this.units[this.persistance.Unit][1] + '" value="' + newV +'" step="' + this.units[this.persistance.Unit][2] + '" tabindex="-1" />').appendTo(this.bottomContainer).mousedown(function(){this.rangeClick=true;}).mouseup(function(){this.rangeClick=true;}).mousemove(function(){
		if(this.rangeClick){
			self.changeWSpeed($(this).val());
		}
    }).change(function(){
		this.rangeClick=false;
	});
	this.rangeWS.css({ 
			'background-color': "hsla(32, 93%, 50%," + (this.wSpeed*1/this.maxSpeed)+")"
	});
};

Winds.prototype.onVehicleReset = function(){
	this.updateNeeded = true;
}