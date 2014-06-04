function Converter(inMin, inMax, outMin, outMax)
{
	this.inMin = inMin;
	this.inMax = inMax;
	this.inLength = inMax - inMin;
	this.outMin = outMin;
	this.outMax = outMax;
	this.outLength = outMax- outMin;
}
Converter.prototype.convertValue = function(value)
{
	if(value<this.inMin) valueIn = this.inMin;
	if(value>this.inMax) valueIn = this.inMax;
	return (value/this.inLength)*this.outLength + this.outMin;
};
Converter.prototype.convertLength = function(length)
{
	return (length/this.inLength)*this.outLength;
};

function toInt(val){
	if(typeof val == "string"){
		return toInt(parseInt(val));
	}else if(typeof val == "number"){
		return val | 0;
	}else{
		return NaN;
	}
}

function stacktrace() {
    var stack = new Error().stack.split('\n');
	stack.splice(0,2);
    return "STACKTRACE\n" + stack.join('\n');
}

function rSet(toModify, newLength, padChar) {
    var s = "";
    if(!padChar) {
        var padChar = "0";
    }
    if(!newLength) {
        var newLength = 4;
    }
    for (var i=0; i<newLength; i++) {
        s += padChar;
    }
    s += toModify;
    return s.substr(s.length-newLength);
};
