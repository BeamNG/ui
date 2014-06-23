function VehicleDebug(){}

VehicleDebug.prototype.initialize = function(){

    $('<button>Break all Breakgroups</button>').appendTo(this.rootElement).click(function(){
        beamng.sendActiveObjectLua("beamstate.breakAllBreakgroups()");
    });
    $('<button>Break all Hinges</button>').appendTo(this.rootElement).click(function(){
        beamng.sendActiveObjectLua("beamstate.breakHinges()");
    });
    $('<button>Deflate Tires</button>').appendTo(this.rootElement).click(function(){
        beamng.sendActiveObjectLua("beamstate.deflateTires()");
    });

    this.dynamicButtonContainer = $('<div></div>').appendTo(this.rootElement);

    // TODO: hydros
};


VehicleDebug.prototype.update = function(streams){
    if(streams.torqueCurve!== undefined){ // <- car/engine changed
        console.log(this.dynamicButtonContainer);
        this.dynamicButtonContainer.empty(); // <- delete old Buttons

        var self = this;
        $.each(streams.wheelInfo, function(index, wheel) { // <- go through the wheels
             self.addDeflateButton(index, wheel[0]);
        });
    }
};

VehicleDebug.prototype.addDeflateButton = function(number, name){
    $('<button>Deflate '+name+' Tire</button>').appendTo(this.dynamicButtonContainer).click(function(){
        beamng.sendActiveObjectLua("beamstate.deflateTire("+number+")");
    });
};
