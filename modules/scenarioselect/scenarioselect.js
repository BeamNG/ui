angular.module('beamng.stuff')

.controller('ScenarioSelectController', ['$scope', '$http', '$interval', 'bngApi',
  function($scope, $http, $interval, bngApi) {
  bngApi.engineLua('scenarios.getList()', function(res) {
    console.log('got scenarios', res);
    for (var i = 0; i < res.length; i++) {
      if (res[i].previews && res[i].previews.length > 0) {
        res[i].preview = res[i].previews[0];
        res[i].preImgIndex = 0;
      }
    }
    $scope.$apply(function() {
      $scope.scenarios = res;
      if (!$scope.selected) {
        $scope.selected = res[0];
        $scope.selectScenario($scope.selected);
      }
    });
  });


  // TODO: select the first entry of the filtered list always
  var selectedTimer = 0;//Timer to make previews one by one in a certain duration


  function changePreview() {
    $scope.selected.preImgIndex++;
    if ($scope.selected.preImgIndex > $scope.selected.previews.length - 1) {
      $scope.selected.preImgIndex = 0;
    }
    $scope.selected.preview = $scope.selected.previews[$scope.selected.preImgIndex];
  }

  $scope.difText = function (num) {
    var val = ['Easy', 'Medium', 'Hard', 'Very Hard'];
    return val[Math.floor(num/25)];
  }

  $scope.selectScenario = function(scenario) {
    $interval.cancel(selectedTimer);
    $scope.selected = scenario;
    if (!$scope.selected.previews) {
      $scope.selected.preview = null;
      return;
    }
    $scope.selected.preview = $scope.selected.previews[$scope.selected.preImgIndex];
    if ($scope.selected.previews.length > 1) {
      selectedTimer = $interval(changePreview, 3000);
    }
  };

  $scope.startScenario = function(scenario) {
    var lua = 'scenarios.start(' + bngApi.serializeToLua(scenario) + ')';
    bngApi.sendEngineLua(lua);
    window.location.hash = '#/loading';
  };

  // set up the display
  $scope.selectedMenu = '#/Scenarioselect';
  $scope.navClass = 'contentNavScenarioselect';
  $scope.$parent.showDashboard = true;
  //$scope.tileSize = 4;

  // tile clicking: single and double clicking
  $scope.clickTile = function(scenario) {
    var maxDoubleClickDelayMS = 300; // allow 300 ms for double clicking
    var timestamp = new Date().getTime();
    if (this.lastTileClick !== undefined && timestamp - this.lastTileClick < maxDoubleClickDelayMS) {
      // double click
      $scope.startScenario(scenario);
    }
    this.lastTileClick = timestamp;
    // boring single click only
    $scope.selectScenario(scenario);
  };
  
  
  
  $scope.backToTop = function () {
    console.log('back to top');
  };

}]);
