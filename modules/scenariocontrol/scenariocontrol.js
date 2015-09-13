// (function() {
// 'use strict';

// angular
// .module('ScenarioControl', ['beamngApi'])
// .config(['$routeProvider', function($routeProvider) {
//   $routeProvider
//     .when('/scenariocontrol/start', {
//       templateUrl: 'modules/scenariocontrol/start.html',
//       controller: 'ScenarioControlController'
//     }).
//      when('/scenariocontrol/end/:time/:state/', {
//       templateUrl: 'modules/scenariocontrol/end.html',
//       controller: 'ScenarioControlEndController'
//     });
// }])

angular.module('beamng.stuff')
.controller('ScenarioControlController', ['$log', '$scope', '$state', 'bngApi', function ($log, $scope, $state, bngApi) {

  $scope.$on('$destroy', function() {
    $scope.play();
  });

  $scope.play = function() {
    $state.go('menu');
    bngApi.engineLua('scenarios.onScenarioUIReady()');
  };

  $scope.$on('ScenarioChange', function (event, data) {
    $log.debug('[scenariocontrol.js] received ScenarioChange:', data);
    $scope.data = data;
  });

}])

.controller('ScenarioControlEndController', ['$log', '$scope', '$routeParams', 'bngApi', function($log, $scope, $routeParams, bngApi) {

  $scope.selectedMenu = '#/scenarioEnd';
  $scope.navClass = 'contentNavScenarioControl';
  $scope.$parent.showDashboard = false;
  $scope.$parent.appEnginePadding = $scope.$parent.menuWidth;
  $scope.query = '';
  $scope.time = $routeParams.time;
  if($routeParams.state == "0")
  {
    $scope.status = "Failed";
    $scope.rewardPic = "thumb_down";
  }
  else
  {
    $scope.status = "Sccueed!";
    $scope.rewardPic = "thumb_up";
  }

  $scope.$on('$destroy', function() {
    //console.log('scenarios end');
    $scope.$parent.showDashboard = true;
    // HookManager.unregisterAll(hookObj);
  });

  $scope.retry = function() {
    window.location.hash = '#/';
    bngApi.engineScript('beamNGResetPhysics();');
  };

  $scope.next = function() {

  };

  $scope.freeRoam = function() {
    window.location.hash = '#/';
  };
}]);
