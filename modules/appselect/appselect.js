angular.module('beamng.stuff')
.controller('AppSelectController', ['$log', 'InstalledMods', function ($log, InstalledMods) {
	var vm = this;
	vm.list = InstalledMods.apps;

	console.log('the app list is:', vm.list);
	
}]);