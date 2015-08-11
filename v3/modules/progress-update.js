angular.module('VehicleSelect')
.directive('progressUpdate', ['$interval', '$window', function ($interval, $window) {
  return {
  	restrict: 'E',
  	replace: true,
    scope: {},
  	template: '<div style="position: absolute; bottom: 0; left: 0; width:300px; height: 50px;">' + 
                '{{ text }}' +
                '<md-progress-linear md-mode="determinate" ng-value="progress"></md-progress-linear>' +
              '</div>',
  	link: function (scope, element, attrs) {
      console.log('hi!');

      scope.progress = 10;
      scope.text = ''

  		$window.updateProgress = function (val, txt) {
        scope.text = txt;
        scope.progress = val;
        console.log('updating progress', val, txt);
  		};

      scope.$on('$destroy', function () {
        delete $window.updateProgress;
      });
  	}
  };
}]);