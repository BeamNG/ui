angular.module('beamng.stuff')
.controller('DebugController', ['$scope', '$window', 'bngApi', function($scope, $window, bngApi) {


  // make the beamng api available in the template
  $scope.bngApi = bngApi;

  $scope.state = {};

  function tsVariable(varName) {
    return function(val) {
      tsCodeInternal(varName + '=' + val);
    };
  }

  function tsFunction(funcName) {
    return function(val) {
      tsCodeInternal(funcName + '(' + val + ')');
    };
  }

  function tsCodeInternal(code) {
    //console.log(code);
    bngApi.engineScript(code + ';');
  }

  function tsCode(code) {
    return function() {
      tsCodeInternal(code);
    };
  }

  function bdebugUpdate (property) {
    return function(value) {
      var fakeState = {
        changes: ['bdebug'],
        bdebug: {}
      };
      fakeState.bdebug[property] = value;
      var sendStr = 'guiUpdate(' + bngApi.serializeToLua(fakeState) + ')';
      //console.log(sendStr);
      bngApi.activeObjectLua(sendStr);
    };
  }

  function watch(sVar, func) {
    $scope.$watch('state.' + sVar, function(val, oldVal) {
      if (val != oldVal) {
        func(val, oldVal);
      }
    });
  }
  // global
   watch('physicsEnabled', tsFunction('beamNGsetPhysicsEnabled'));
   watch('debugEnabled', bdebugUpdate('enabled'));

  // // renderer
  watch('renderer.fps', tsCode('toggleFPS(1)'));
  watch('renderer.boundingboxes', tsVariable('$Scene::renderBoundingBoxes'));
  watch('renderer.disableShadows', tsVariable('$Shadows::disable'));
  watch('renderer.wireframe', tsVariable('$gfx::wireframe'));
  watch('renderer.visualization', function(val, oldVal) {
     var vizFuncs = {
       'None': function() {
         vizFuncs[oldVal]();
       },
       'Depth': function() {
         tsFunction('toggleDepthViz')('');
       },
       'Normal': function() {
         tsFunction('toggleNormalsViz')('');
       },
       'Light Color': function() {
         tsFunction('toggleLightColorViz')('');
       },
       'Specular': function() {
         tsFunction('toggleLightSpecularViz')('');
       }
     };
     vizFuncs[val]();
  });

  // // effect
  watch('effect.fov', tsFunction('setFov'));


  // new pattern

  // var hookObj = {
  //   onBdebugUpdate: function(newState) {
  //     if(Object.keys(newState).length === 0) return;
  //     //console.log('got new beamDebugState');
  //     //console.log(newState);
  //     $scope.justGotNewState = true; // prevents watch() to send this crap out directly again
  //     $scope.$apply(function() {
  //       $scope.state = newState;
  //     });
  //     $scope.justGotNewState = null;
  //   }
  // }

  // HookManager.registerAllHooks(hookObj);

  $scope.$on('BdebugUpdate', function (event, newState) {
    if(Object.keys(newState).length === 0) return;
    $scope.justGotNewState = true; // prevents watch() to send this crap out directly again
      $scope.$apply(function() {
        $scope.state = newState;
      });
    $scope.justGotNewState = null;
  });


  // initial request
  bngApi.activeObjectLua('bdebug.requestState()');

  $scope.$watch('state', function(newVal, oldState) {
    if($scope.justGotNewState || Object.keys($scope.state).length === 0) return false;
    //console.log(bngApi.serializeToLua($scope.state));
    bngApi.activeObjectLua('bdebug.setState(' + bngApi.serializeToLua($scope.state) + ')');
  }, true);
}]);
