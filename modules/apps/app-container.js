angular.module('beamng.apps', [])

.directive('appContainer', function () {
	return {
		restrict: 'E',
		template: '<div ng-transclude style="position:absolute; top: 0; right: 0; left: 0; bottom: 0;"></div>',
		transclude: true,
		replace: true,
		controller: ['$scope', '$window', function ($scope, $window) {
			$window.oUpdate = function (streams) {
				$scope.$broadcast('streamsUpdate', streams)
			};

			$scope.speak = function () {
				alert('FOCUSED!');
			};
		}],
		link: function (scope, element) {
			console.log('hey!!!');
		}
	};
});