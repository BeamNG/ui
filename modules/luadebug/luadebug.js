(function() {
'use strict';

angular
.module('LuaDebug', ['beamngApi', 'MenuServices'])
.config(['$routeProvider', 'dashMenuProvider', function($routeProvider, dashMenuProvider) {
  $routeProvider
    .when('/luadebug', {
      templateUrl: 'modules/luadebug/luadebug.html',
      controller: 'LuaDebugController'
    });
  //dashMenuProvider.addMenu({hash: '#/luadebug', title: 'Lua Debug', icon: 'bug_report', modes: ['play'], order: 75, devMode: true});
  dashMenuProvider.addMenu({divider: true, order: 79});
}])

.controller('LuaDebugController', ['$scope', 'bngApi', function($scope, bngApi) {

  // set up the display
  $scope.selectedMenu = '#/luadebug';
  $scope.navClass = 'contentLuaDebug';
  $scope.useThemeBackground = true;
  $scope.$parent.showDashboard = true;
  $scope.query = '';

  $scope.enabled = false;
  $scope.windowSize = 1;
  $scope.luaData = {};
  $scope.luaView = 'T3D';

  //var first = false;
  function getLuaPerfData(data) {
    //if(!first) {
    //  console.log(data);
    //  first = true;
    //}
    $scope.$apply(function() {
      $scope.luaData[data.source] = data;
    });
  }

  var hookObj = {
    onLuaPerf: getLuaPerfData,
  };

  HookManager.registerAllHooks(hookObj);

  $scope.$on('$destroy', function() {
    HookManager.unregisterAll(hookObj);
  });

  function enable() {
    bngApi.sendEngineLua('perf.enable(' + $scope.windowSize + ', "LuaPerf", {source = "T3D"})');
    bngApi.sendActiveObjectLua('perf.enable(' + $scope.windowSize + ', "LuaPerf", {source = "v0"})');
  }

  function disable() {
    bngApi.sendEngineLua('perf.disable()');
    bngApi.sendActiveObjectLua('perf.disable()');
    $scope.luaData = {};
  }

  $scope.$watch('enabled', function(newVal, oldVal) {
    if (newVal == oldVal) {
      return;
    }
    if (newVal) {
      enable();
    } else {
      disable();
    }
  });

  $scope.$watch('windowSize', function(newVal, oldVal) {
    if (newVal == oldVal) {
      return;
    }
    if ($scope.enabled) {
      disable();
    }
    enable();
  });

}]);

})();
