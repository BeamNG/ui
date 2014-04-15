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