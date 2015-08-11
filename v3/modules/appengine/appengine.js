(function() {
  'use strict';

  angular
    .module('AppEngine', [])
    .directive('bngAppengineLegacy', bngAppengineLegacyDirective);

  function bngAppengineLegacyDirective() {
    return {
      restrict: 'E',
      scope: {
      },
      controller: ['$scope', function($scope) {
        $scope.leftPadding = '50px';
        $scope.iframesrc = '../play.html?t=' + Date.now(); // this prevents caching of the iframe

        window.oUpdate = function(v) {
          $scope.objectData = v;
          // hide the oupdate error if the iframe is not loaded completely yet
          //try {
          var cw = document.getElementById('appengineContainer').contentWindow;
          if (cw && typeof cw.oUpdate == 'function') {
            cw.oUpdate(v);
          }
          //} catch (ex) {
          //  console.error('exception in appengine: ', ex.message);
          //  console.log(ex);
          //}
        };

        window._fCallback = function(idx, result) {
          try {
            result = JSON.parse(result);
          } catch (e) {}

          document.getElementById('appengineContainer').contentWindow.functionCallbacks[idx](result);
          document.getElementById('appengineContainer').contentWindow.functionCallbacks[idx] = undefined;
        };

        window.bngApp = {
          store:  function() {return document.getElementById('appengineContainer').contentWindow.AppStore;},
          engine: function() {return document.getElementById('appengineContainer').contentWindow.AppEngine;},
          loader: function() {return document.getElementById('appengineContainer').contentWindow.AppLoader;}
        };
      }],
      
      templateUrl: 'modules/appengine/appengine_container.html'
    };
  }
})();
