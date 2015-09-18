angular.module('beamng.apps', [])

.directive('appContainer', ['bngApi', function (bngApi) {
  return {
    restrict: 'E',
    template: '<div ng-transclude style="position:absolute; top: 0; right: 0; left: 0; bottom: 0;"></div>',
    transclude: true,
    replace: true,
    controller: ['$scope', '$window', function ($scope, $window) {
	
      // Just testing ....
      var state = {changes: ['streams'], streams: {sensors: 1}};
      bngApi.activeObjectLua('guiUpdate(' + bngApi.serializeToLua(state) + ')');

      $window.oUpdate = function (streams) {
        $scope.$broadcast('streamsUpdate', streams)
      };
    }],

    link: function (scope, element) {
      console.log('app-container is here.');
      element.on('click', function (event) {
        console.log('app-container clicked', event);
      });
    }
  };
}]);