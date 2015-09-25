angular.module('beamng.stuff')
.controller('AppSelectController', ['$log', '$rootScope', 'InstalledMods', function ($log, $rootScope, InstalledMods) {
	var vm = this;
  vm.list = InstalledMods.apps;

  $log.info('the app list:', vm.list);

  vm.spawn = function (appDirective) {
    $log.info('[AppSelectController] spawing %s', appDirective);
    // $rootScope.$broadcast('spawnApp', {directive: appDirective});
  };

  vm.edit = function () {
    $log.info('[AppSelectController] going to app-edit mode');
  };

}]);