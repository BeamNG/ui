(function() {
'use strict';

angular
.module('UIEdit', ['ngMaterial', 'MenuServices'])
.config(['$routeProvider', 'dashMenuProvider', function($routeProvider, dashMenuProvider) {
  $routeProvider
    .when('/uiedit', {
      templateUrl: 'modules/uiedit/uiedit.html',
      controller: 'UIEditController'
    });
  dashMenuProvider.addMenu({hash: '#/uiedit', title: 'UI Editor', icon: 'web', modes: ['play'], order: 60, devMode: true});
}])

.controller('UIEditController', ['$scope', function($scope) {
  // set up the display
  $scope.selectedMenu = '#/uiedit';
  $scope.navClass = 'contentNavUIEdit';
  $scope.$parent.showDashboard = true;
  $scope.$parent.appEnginePadding = 0; //$scope.$parent.menuWidth;
  $scope.$parent.menuHide();

  function showEditmode(show) {
    var appContainer = document.getElementById('appengineContainer');
    if (appContainer && appContainer.contentWindow.AppEngine) {
      appContainer.contentWindow.AppEngine.setEditMode(show);
    }
  }

  showEditmode(true);

  $scope.$on('$destroy', function() {
    showEditmode(false);
  });
}]);

})();
