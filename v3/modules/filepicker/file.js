(function() {
'use strict';

angular
.module('file', ['ngMaterial', 'beamngApi'])
.directive('ngFile', function() {
  return {
    restrict: 'E',
    scope: {
      initPath: '=path',
      // show: '=showFolder',
    },
    templateUrl: 'modules/filepicker/file.html',
    controller: ['$scope', '$mdDialog', 'bngApi', function($scope, $mdDialog, bngApi) {
      $scope.path = $scope.initPath;
      $scope.folders = [];

      $scope.dirExists = function() {
        //do some lua magic to be sure the given path exists
        if (true) { //dir exists
          // $scope.folders = []; // Array with names of all contained folders
          return false;
        }
        return true;
      };

      $scope.showConfirm = function(ev, mod) {
        var confirm = $mdDialog.confirm()
          // .parent(angular.element(document.body))
          .title('Are you sure you want to change the user path?')
          .content('This will require BeamNG.drive to resart')
          .ariaLabel('Confirm change path')
          .ok('Yes, do it!')
          .cancel('No, I\'ve got no idea what I\'m doing')
          .targetEvent(ev);
        $mdDialog.show(confirm).then(function() {
          if (!mod) {
            $scope.path = '';
          }
          $scope.initPath = $scope.path;

          //do both outside of the directive:
          //Change path
          //Restart game
          //bngApi.sendGameEngine('quit();'); //change to restart?
        });
      };
    }]
  };
});

})();
