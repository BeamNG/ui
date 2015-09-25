angular.module('beamng.stuff')

.controller('ScenarioStartController', ['$log', '$scope', '$state', 'bngApi', function ($log, $scope, $state, bngApi) {
  var vm = this;
  vm.descriptionHref = null;

  vm.play = function () {
    bngApi.engineLua('scenarios.onScenarioUIReady("play")');
    bngApi.engineLua('extensions.hook("onScenarioRaceCountingDone")');
    $scope.$emit('MenuHide', null);
    $state.go('menu');
  };

  // if we accidentally exit this state, start anyway
  $scope.$on('$destroy', function() {
    bngApi.engineLua('scenarios.onScenarioUIReady("play")');
    bngApi.engineLua('extensions.hook("onScenarioRaceCountingDone")');
  });


  $scope.$on('ScenarioChange', function (event, data) {
    $log.debug('[scenariocontrol.js] received ScenarioChange:', data);
    if (data.startHTML) {
      vm.descriptionHref = '/' + data.sourcePath + '/' + data.startHTML;
      $log.info('[ScenarioStartController] getting scenario description from %s', vm.descriptionHref);
    }
    $scope.$digest();
  });

  // Run on launch
  // -------------

  // This is actually a request to the Lua engine to send a "ScenarioChange"
  // event through the HookManager, with information about the about-to-start scenario.
  // A listener is already registered.
  bngApi.engineLua('scenarios.onScenarioUIReady("start")');
}])

.controller('ScenarioEndController', ['$log', '$scope', '$state', 'bngApi', function($log, $scope, $state, bngApi) {
  var vm = this;
  vm.result = { icon: '', message: '', color: '' };

  vm.retry = function () {
    bngApi.engineScript('beamNGResetPhysics();')
    $scope.$emit('MenuHide', null);
    $state.go('menu');
  };

  vm.next = function () {
    $state.go('menu.scenarios');
  };

  vm.freeRoam = function() {
    $scope.$emit('MenuHide', null);
    $state.go('menu');
  };

  $scope.$on('ScenarioChange', function (event, data) {
    if (data.result.failed)
      vm.result = {icon: 'cancel', color: '#F34242', message: data.result.failed };
    else 
      vm.result = {icon: 'check_circle', color: '#52EC41', message: data.result.msg };

    $scope.$digest();
  });

  // Run on launch
  // -------------

  // This is actually a request to the Lua engine to send a "ScenarioChange"
  // event through the HookManager, with information about the finished scenario.
  // A listener is already registered.
  bngApi.engineLua('scenarios.onScenarioUIReady("post")');
}]);
