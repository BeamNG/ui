angular.module('beamng.stuff')
.controller('AppSelectController', ['$log', 'InstalledMods', function ($log, InstalledMods) {
	var vm = this;
	vm.list = InstalledMods.apps;

	$log.info('the app list:', vm.list);
}]);