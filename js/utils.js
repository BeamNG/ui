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
}

function repeatChar(count, ch) {
    if (count == 0) {
        return "";
    }
    var count2 = count / 2;
    var result = ch;

    // double the input until it is long enough.
    while (result.length <= count2) {
        result += result;
    }
    // use substring to hit the precise length target without
    // using extra memory
    return result + result.substring(0, count - result.length);
}

function randomNumbers(size){
    var perm = [];
    var i, j, ex;
    for (i = 0; i < size; i++) {
        perm[i] = i;
    }

    for (i = size-1; i >= 0; i--) {
        j = (Math.random()*i) | 0;
        ex = perm[j];
        perm[j] = perm[i];
        perm[i] = ex;
    }

    return perm;
}

function Timer(name){
    var starttime;
    var times;

    function start(){
        starttime = performance.now();
        times = [];
        point('Start');
    }

    function point(name){
        if(!name){
            name = '';
        }
        times.push([name,performance.now()]);
    }
    function toString(){
        var runtime = times[times.length - 1][1] - starttime;

        //Some Formatting
        var length = 0;
        _.each(times, function(time){
            if(time[0].length > length){
                length = time[0].length;
            }
        });
        _.each(times, function(time,index){
            if(time[0].length < length){
                times[index][0] = time[0] + repeatChar(length - time[0].length, ' ');
            }
        });
        var resultStr = "\nTimer: "+name+"\n";
        if(times.length>1){
            resultStr += "Runtime: "+runtime.toFixed(0)+"ms\nmeasure points: \n";
            _.each(times,function(time, index){
                if(index === 0){
                    return;
                }
                var relativeTime = time[1]-times[index-1][1];
                resultStr += time[0]+"\t"+(relativeTime).toFixed(0)+"ms\t";
                resultStr += (time[1]-starttime).toFixed(0)+"ms\t";
                resultStr += ((relativeTime/runtime)*100).toFixed(2)+"%\n";
            });
        }else{
            resultStr += "not enough mesaure points";
        }

        return resultStr+"\n";
    }
    function print(){
        console.log(toString());
    }

    // interface
    this.start = start;
    this.point = point;
    this.toString = toString;
    this.print = print;
}

function globalDecorator(name, func){
    if(window[name]){
        var original = window[name];
        var newF = func;
        window[name] = function(){
            func.apply(func,arguments);
            original.apply(original,arguments);
        }
    }else{
        window[name] = func;
    }
}