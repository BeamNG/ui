angular.module('VehicleSelect')
.directive('pauseScreen', function () {
	return {
		restrict: 'E',
		scope: false,
		template: '<div class="physics-disabled-infocontainer">' +
                '<span>GAME PAUSED - PRESS J TO RESUME</span>' +
            		'<md-icon class="material-icons" style="font-size: 50px">pause_circle_outline</md-icon>' + 
            	'</div>',
    link: function (scope, element, attrs) {}
	};
})