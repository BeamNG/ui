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
    $('<button>TEST</button>').appendTo(this.rootElement).click(function(){
        alert(cefdev);
    });
    // TODO: hydros

};


VehicleDebug.prototype.update = function(streams){
};
