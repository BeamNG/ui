angular.module('beamng.stuff')
  .controller('CreditsController', ['$scope', '$timeout', '$window', '$state', function($scope, $timeout, $window, $state) {
    // set up the display
    // $scope.selectedMenu = '#/credits';
    // $scope.navClass = 'contentNavCredits';
    // $scope.$parent.showDashboard = false;

    $scope.$on('$destroy', function() {
      $timeout.cancel($scope.timeOutPromise);
      $scope.$parent.showDashboard = true;
    });

    $scope.end = function() {
      angular.element($window).off('keyup', $scope.end);
      angular.element($window).off('keydown', $scope.end);
      $state.transitionTo('menu');
      // window.location.hash = ($scope.gameState == 'menu') ? '#/mainmenu' : '#/';
    };

    angular.element($window).on('keyup', $scope.end);
    angular.element($window).on('keydown', $scope.end);

    var pfx = ["webkit", "moz", "MS", "o", ""];
    function PrefixedEvent(element, type, callback) {
      for (var p = 0; p < pfx.length; p++) {
        if (!pfx[p]) type = type.toLowerCase();
        element.addEventListener(pfx[p]+type, callback, false);
      }
    }

    PrefixedEvent(document.getElementsByClassName('wrapper')[0], "AnimationEnd", function() {
      console.log('test');
      $scope.timeOutPromise = $timeout(function() {
        $scope.end();
      }, 500);
    });

  }]);
