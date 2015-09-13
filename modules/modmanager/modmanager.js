// (function() {
// 'use strict';

// angular
// .module('ModManager', ['beamngApi', 'MenuServices',  'ui.grid', 'ui.grid.grouping', 'ui.grid.resizeColumns'])
// .config(['$routeProvider', 'dashMenuProvider', function($routeProvider, dashMenuProvider) {
//   $routeProvider
//     .when('/modmanager', {
//       templateUrl: 'modules/modmanager/modmanager.html',
//       controller: 'ModManagerController'
//     });
//   dashMenuProvider.addMenu({hash: '#/modmanager', title: 'Mods', icon: 'shop', order: 12});
// }])

angular.module('beamng.stuff')

.filter('moment', function () {
  return function (timestamp, format) {
    if(!timestamp) return '';
    return moment(timestamp * 1000).format(format);
  };
})

.controller('ModManagerController', ['$log', '$scope', 'bngApi', function($log, $scope, bngApi) {

  // set up the display
  // $scope.selectedMenu = '#/modmanager';
  // $scope.navClass = 'contentModManager';
  // $scope.useThemeBackground = true;
  // $scope.$parent.showDashboard = true;
  $scope.query = '';

  $scope.gridOptions = {
    saveFocus: false,
    saveScroll: true,
    enableSorting: true,
    enableGridMenu: true,
    enableHorizontalScrollbar: 0,
    enableColumnResize: true,
    
    saveGroupingExpandedStates: true,
    enableFiltering: true,
    rowTemplate: '<div ng-class="{ \'my-css-class\': grid.appScope.rowFormatter( row ) }">' +
                 '  <div >{{row.entity.title}}</div>' +
                 '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" '+
                 'ng-class-even="{\'modUnpackedEven\':row.entity.unpackedPath!==undefined, \'modActiveEven\':row.entity.active!==false, \'modInactiveEven\':row.entity.active===false}" '+
                 'ng-class-odd="{\'modUnpackedOdd\':row.entity.unpackedPath!==undefined, \'modActiveOdd\':row.entity.active!==false, \'modInactiveOdd\':row.entity.active===false}"  ng-class="{ \'ui-grid-cell\': true, \'ui-grid-row-header-cell\': col.isRowHeader}"  ui-grid-cell></div>' +
                 '</div>',

    columnDefs: [
      { field: 'displaypath', displayName: 'Filename'},
      { field: 'dateAdded',  displayName: 'Date added', visible:false, cellTemplate: "<div>{{row.entity[col.field] | moment: 'MMMM Do YYYY, h:mm:ss a'}}</div>" },
      { field: 'stat.createtime',  displayName: 'Date created', visible:false, cellTemplate: "<div>{{row.entity.stat.createtime | moment: 'MMMM Do YYYY, h:mm:ss a'}}</div>" },
      { field: 'stat.modtime',  displayName: 'Date modified', visible:false, cellTemplate: "<div>{{row.entity.stat.modtime | moment: 'MMMM Do YYYY, h:mm:ss a'}}</div>" },
      { field: 'stat.accesstime',  displayName: 'Date accessed', visible:false, cellTemplate: "<div>{{row.entity.stat.accesstime | moment: 'MMMM Do YYYY, h:mm:ss a'}}</div>" },
      { field: 'stat.filesize',  displayName: 'Filesize', visible:false, cellTemplate: "<div>{{row.entity.stat.filesize | bytes: 0}}" },
      { field: 'active',  displayName: '', width: '50%', enableFiltering: false, enableSorting: false, cellTemplate: '\
<md-button ng-if="row.entity.active === false" class="" style="width:120px;" ng-click="grid.appScope.activateMod(row.entity)">Activate</md-button> \
<md-button ng-if="row.entity.active === true" class="" style="width:120px;" ng-click="grid.appScope.deactivateMod(row.entity)">Deactivate</md-button> \
<md-button ng-if="row.entity.active !== undefined && row.entity.unpackedPath === undefined" class="" style="width:120px;" ng-click="grid.appScope.unpackMod(row.entity)">unpack</md-button> \
<md-button ng-if="row.entity.active !== undefined" class="" style="width:120px;" ng-click="grid.appScope.openInExplorer(row.entity)">open</md-button> \
<md-button ng-if="row.entity.active !== undefined && row.entity.unpackedPath !== undefined" class="" style="width:120px;" ng-click="grid.appScope.packMod(row.entity)">pack</md-button> \
<md-button ng-if="row.entity.active !== undefined && row.entity.unpackedPath === undefined" class="md-warn" ng-click="grid.appScope.deleteMod(row.entity)">Delete</md-button>'

},
      { name: 'modType', displayName: 'Type', width: '20%', grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'asc' } }
      ],
  };

  function triggerLoadingScreen(fct) {
    $scope.$parent.fullScreenLoadingIndicator = true;

    // allow the loading indicator to show up
    setTimeout(fct, 150);

    // hide the loading screen after some time
    setTimeout(function() {
      $scope.$apply(function() {
        $scope.$parent.fullScreenLoadingIndicator = false;
      });
    }, 1000);
  }

  $scope.deactivateAllMods = function() {
    triggerLoadingScreen(function() {
      bngApi.engineLua('modmanager.deactivateAllMods()');
    });
  };

  $scope.activateAllMods = function() {
    triggerLoadingScreen(function() {
      bngApi.engineLua('modmanager.activateAllMods()');
    });
  };

  $scope.activateMod = function(mod) {
    //console.log('activateMod', mod);
    bngApi.engineLua('modmanager.activateMod("' + mod.fullpath + '")');
  };

  $scope.deactivateMod = function(mod) {
    //console.log('deactivateMod', mod);
    bngApi.engineLua('modmanager.deactivateMod("' + mod.fullpath + '")');
  };
  
  $scope.unpackMod = function(mod) {
    //console.log('unpackMod', mod);
    triggerLoadingScreen(function() {
      bngApi.engineLua('modmanager.unpackMod("' + mod.fullpath + '")');
    });
  };

  $scope.openInExplorer = function(mod) {
    //console.log('openInExplorer', mod);
    bngApi.engineLua('modmanager.openEntryInExplorer("' + mod.fullpath + '")');
  };


  $scope.packMod = function(mod) {
    //console.log('packMod', mod);
    triggerLoadingScreen(function() {
      bngApi.engineLua('modmanager.packMod("' + mod.fullpath + '")');
    });
  };

  $scope.deleteMod = function(mod) {
    triggerLoadingScreen(function() {
      bngApi.engineLua('modmanager.deleteMod("' + mod.fullpath + '")');
    });
  };

  function onModManagerVehiclesChanged(data) {
    $scope.$apply(function() {
      $scope.vehicles = data;
    });
  }

  function onModManagerModsChanged(data) {
    //console.log(data);
    var list = [];
    // convert to a list, since filter does not work with objects
    var active = 0;
    for(var k in data) {
      data[k].displaypath = data[k].fullpath;
      if(data[k].displaypath.startsWith('mods/')) {
        data[k].displaypath = data[k].displaypath.substring(5);
      }
      list.push(data[k]);
      if(data[k].active != false) {
        active++;
      }
    }

    
    $scope.$apply(function() {
      $scope.vehicles = data.vehicles;
      $scope.gridOptions.data = list;
      $scope.dataSize = list.length;
      $scope.activeMods = active;
      $scope.inactiveMods = list.length - active;
    });
  }

  // var hookObj = {
  //   onModManagerModsChanged: onModManagerModsChanged,
  //   onModManagerVehiclesChanged: onModManagerVehiclesChanged
  // };

  // HookManager.registerAllHooks(hookObj);

  // $scope.$on('$destroy', function() {
  //   HookManager.unregisterAll(hookObj);
  // });

  $scope.$on('ModManagerModsChanged', function (event, data) {
    $log.debug('[modmanager.js] received ModManagerModsChanged:', data);
    onModManagerModsChanged(data);
  });

  $scope.$on('ModManagerVehiclesChanged', function (event, data) {
    $log.debug('[modmanager.js] received ModManagerVehiclesChanged:', data);
    onModManagerVehiclesChanged(data);
  });

  bngApi.engineLua('modmanager.requestState()');
}]);
