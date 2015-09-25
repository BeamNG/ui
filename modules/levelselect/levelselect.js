angular.module('beamng.stuff')
.controller('LevelSelectController',  ['$location', 'bngApi', 'InstalledMods', function($location,  bngApi,  InstalledMods) {
    var vm = this;
    vm.installed = InstalledMods.levels;

    vm.selected = null;

    vm.select = function (level) {
      vm.selected = level;
    };

    vm.launch = function() {
      bngApi.engineScript('startLevel("' + vm.selected.misFilePath + '");');
    };
}]);
