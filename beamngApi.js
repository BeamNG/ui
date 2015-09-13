angular.module('beamng.stuff')

/**
 * @ngdoc value
 * @name  beamng.stuff:apiCallbacks
 *
 * @description
 * Storage for callbacks to be called from the various other game modules.
**/
.value({ 'apiCallbacks': {} })

/**
 * @ngdoc service
 * @name  beamng.stuff:bngApi
 * @requires beamng.stuff:apiCallbacks
 *
 * @description
 * This is used for communication to the other module of the game,
 * in order to avoid direct usage of the <emph>beamng</emph> object.
 * Almost all functions can be paired with a callback that is stored 
 * in the {@link beamng.stuff:apiCallbacks apiCallbacks} value.
**/
.service('bngApi', ['apiCallbacks', function (apiCallbacks) {
  var callbackId = Math.floor(Math.random() * 60000);

  return {
    /**
     * @ngdoc method
     * @name  .#engineScript
     * @propertyOf .
     * @param {string} cmd
     * @param {function} callback
     *
     * @description
     * Sends a command to the game engine.
    **/
    engineScript: function (cmd, callback) {
      if (!callback) {
        beamng.sendGameEngine(cmd);
        return;
      }

      apiCallbacks[++callbackId] = callback;
      cmdStr = 'beamNGExecuteJS(bngApiCallback(' + callbackId + ',\'" @ strreplace(' + cmd + ',"\'","\\\\\'") @ "\')");';
      beamng.sendGameEngine(cmdStr);
    },

    /**
     * @ngdoc method
     * @name .#activeObjectLua
     * @propertyOf .
     * @param {string} cmd
     * @param {function} callback
     *
     * @description
     * Sends a command to the active Lua object.
    **/
    activeObjectLua: function (cmd, callback) {
      if (!callback) {
        beamng.sendActiveObjectLua(cmd);
        return;
      }

      apiCallbacks[++callbackId] = callback;
      var cmdStr = 'obj:executeJS("bngApiCallback(' + callbackId + ',".. encodeJson(' + cmd + ') ..")");';
      beamng.sendActiveObjectLua(cmdStr);
    },

    /**
     * @ngdoc method
     * @name  .#engineLua
     * @propertyOf .
     * @param {string} cmd
     * @param {function} callback
     *
     * @description
     * Sends a command to the Lua engine.
    **/
    engineLua: function (cmd, callback) {
      if (!callback) {
        beamng.sendEngineLua(cmd);
        return;
      }

      apiCallbacks[++callbackId] = callback;
      var cmdStr = 'be:executeJS("bngApiCallback(' + callbackId + ',".. encodeJson(' + cmd + ') ..")");';
      beamng.sendEngineLua(cmdStr);
    },

    /**
     * @ngdoc method
     * @name  .#systemLua
     * @propertyOf .
     * @param {string} cmd
     *
     * @description
     * Sends a command to Lua system. There is no callback option in this function.
    **/ 
    systemLua: function (cmd) {
      beamng.sendSystemLua(cmd);
    },

    /**
     * @ngdoc method
     * @name  .#serializeToLua
     * @propertyOf .
     * @param {object} obj
     *
     * @description
     * Converts an object to a format compatible with Lua functions.
     *
     * @return
     * A string representation of the object that can be directly used
     * from Lua functions.
    **/
    serializeToLua: function (obj) {
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
    }
  };
}]);