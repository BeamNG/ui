angular.module('beamng.stuff')

.value({
  'apiCallbacks': [],
})

.service('bngApi', ['apiCallbacks', function(apiCallbacks) {

  this.sendActiveObjectLua = function(s) {
    beamng.sendActiveObjectLua(s);
  };

  this.sendEngineLua = function(s) {
    beamng.sendEngineLua(s);
  };

  this.sendGameEngine = function(cmd) {
    beamng.sendGameEngine(cmd);
  };

  this.sendSystemLua = function(cmd) {
    beamng.sendSystemLua(cmd);
  };


  /* Torquescript sucks */
  this.engineScript = function(func, callback) {
    var commandString = 'beamNGExecuteJS("bngApiCallback(' + apiCallbacks.length +
      ',\'" @ strreplace(' + func + ',"\'","\\\\\'") @ "\')");';

    apiCallbacks.push(callback);
    beamng.sendGameEngine(commandString);
  };

  this.activeObjectLua = function(func, callback) {
    var commandString = 'obj:executeJS("bngApiCallback(' + apiCallbacks.length + ',".. encodeJson(' + func + ') ..")");';
    apiCallbacks.push(callback);
    beamng.sendActiveObjectLua(commandString);
  };

  this.engineLua = function(func, callback) {
    var commandString = 'be:executeJS("bngApiCallback(' + apiCallbacks.length + ',".. encodeJson(' + func + ') ..")");';
    apiCallbacks.push(callback);
    beamng.sendEngineLua(commandString);
  };

  this.serializeToLua = function(obj) {
    var tmp;
    if (obj === undefined) { return ''; } //nil';
    switch (obj.constructor) {
      case String:
        return '"' + obj.replace(/\"/g, '\'') + '"';
      case Number:
        return isFinite(obj) ? obj.toString() : null;
      case Boolean:
        return obj ? 'true' : 'false';
      case Array:
        tmp = [];
        for (var i = 0; i < obj.length; i++) {
          if (obj[i] != null) {
              tmp.push(this.serializeToLua(obj[i]));
          }
        }
        return '{' + tmp.join(',') + '}';
      default:
        if (typeof obj == 'object') {
          tmp = [];
          for (var attr in obj) {
            if (typeof obj[attr] != 'function') {
              tmp.push('["' + attr + '"]=' + this.serializeToLua(obj[attr]));
            }
          }
          return '{' + tmp.join(',') + '}';
        } else {
          return obj.toString();
        }
    }
  };

}]);
