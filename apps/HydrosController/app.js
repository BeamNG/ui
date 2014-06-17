function HydrosController(){}

HydrosController.prototype._updateHydrosData = function(){
    beamng.sendActiveObjectLua("hydros.sendHydroStateToGUI()");
}


HydrosController.prototype.initialize = function(){
    this._updateHydrosData();
    var widget = this;

    $('<div id="hydro_ctrls"></div>').appendTo(this.rootElement);

    $('<button>get info</button>').appendTo(this.rootElement).click(function(){
        widget._updateHydrosData();
    });
};

HydrosController.prototype.onHydrosUpdate = function(val){
    //console.log(val);

    var root = $('#hydro_ctrls');
    root.empty();

    //var inputSources = [];
    $.each(val, function(k, v) {

        var label = $('<label for="slider-hydro-' + k + '">' + 'Hydro ' + k + ' (' + v.inputSource + ')</label>');
        label.appendTo(root);
        // TODO: only one inputSource for all hydros
        var s = $('<input type="range" name="slider-hydro-' + k + '" id="slider-hydro-' + k + '" value="' + ((v.cmd * 2000) - 1000) + '" min="" max="2000">');
        s.appendTo(root);
        s.change(function(){
            var newVal = ((s.val() - 1000) / 2000);
            var cmd = 'electrics.values["' + (v.inputSource) + '"] = ' + newVal;
            //console.log(cmd);
            beamng.sendActiveObjectLua(cmd);
        });
    });
    //$('<textarea>'+JSON.stringify(val)+'</textarea>').appendTo(root);;
};

HydrosController.prototype.update = function(streams){
};
