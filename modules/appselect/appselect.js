angular.module('beamng.stuff')
.controller('AppSelectController', ['InstalledMods', function (InstalledMods) {
	var vm = this;
	vm.list = InstalledMods.apps;
	
}]);