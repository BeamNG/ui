angular.module('beamng.stuff')
  .controller('CreditsController', ['$scope', '$timeout', '$window', function($scope, $timeout, $window) {
    // set up the display
    $scope.selectedMenu = '#/credits';
    $scope.navClass = 'contentNavCredits';
    $scope.$parent.showDashboard = false;

    $scope.$on('$destroy', function() {
      $timeout.cancel($scope.timeOutPromise);
      $scope.$parent.showDashboard = true;
    });

    $scope.end = function() {
      angular.element($window).off('keyup', $scope.end);
      angular.element($window).off('keydown', $scope.end);
      window.location.hash = ($scope.gameState == 'menu') ? '#/mainmenu' : '#/';
    };

    angular.element($window).on('keyup', $scope.end);
    angular.element($window).on('keydown', $scope.end);

    $scope.timeOutPromise = $timeout(function() {
      $scope.end();
    }, 100000);

  }]);
