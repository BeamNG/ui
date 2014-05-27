function SimpleDigTacho() {}

function pad1k(num) {
    var s = "0000" + num;
    return s.substr(s.length-4);
}

SimpleDigTacho.prototype.initialize = function () {
    this.rpmDiv = $('<div></div>').appendTo(this.rootElement).addClass('rpmDiv');
    this.labelDiv = $('<div></div>').appendTo(this.rootElement).addClass('labelDiv');

    this.loaded = false;
};

SimpleDigTacho.prototype.update = function (streams) {

    //Get the values to work with, do rounding and stuff as needed TODO: Get if car is manual or automatic automatically when this is exposed to the ui system
	rpm = toInt(streams["engineInfo"][4]);

    this.rpmDiv.html(pad1k(rpm));
    this.labelDiv.html("Engine RPM");
};
