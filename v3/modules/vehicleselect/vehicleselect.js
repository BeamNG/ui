angular.module('beamng.stuff')

  // .config(['$routeProvider', 'dashMenuProvider', function($routeProvider, dashMenuProvider) {
  //   $routeProvider
  //     .when('/vehicleselect', {
  //       templateUrl:  'modules/vehicleselect/vehicleselect.html',
  //       controller:   'VehicleSelectController',
  //       controllerAs: 'vehicles',
  //       resolve: {
  //         populate: ['Vehicles', function (Vehicles) {
  //           return Vehicles.getModels();
  //         }]
  //       }
  //     })

  //     .when('/vehicleselect/:modelName', {
  //       templateUrl:  'modules/vehicleselect/vehicleselect-details.html',
  //       controller:   'VehicleDetailsController',
  //       controllerAs: 'details',
  //     });

  //   dashMenuProvider.addMenu({hash: '#/vehicleselect', title: 'Vehicles', modes: ['play'], icon: 'directions_car', order: 20});
  // }])



  // .value('VehiclesInfo', {
  //   index: {},
  //   list: [],
  // })

  // .value('VehicleFilters', {
  //   filters: {}
  // })

  // .service('Vehicles', ['$timeout', '$q', 'bngApi', 'VehiclesInfo', 'VehicleFilters',
  //   function ($timeout, $q, bngApi, VehiclesInfo, VehicleFilters) {
  //   var service = {

  //     getModels: function () {
  //       var d = $q.defer();

  //       bngApi.engineLua('vehicles.getVehicleList()', function (response) {
  //         if (response) {
  //           VehiclesInfo.index = response.index;
  //           VehiclesInfo.list  = response.list;
  //           for (var f in response.filters) {
  //             if (VehicleFilters.filters[f]) {
  //               continue;
  //             } else {
  //               VehicleFilters.filters[f] = response.filters[f];
  //             }
  //           }
  //         }

  //         d.resolve();
  //       });

  //       return d.promise;
  //     },

  //     addToGame: function (model, config, color, spawnNew, parentScope) {
  //       var d = $q.defer()
  //         , pcFile = ['vehicles', model.key, config || model['default_pc'] || ''].join('/') + '.pc';

  //       if (model['colors'])
  //         color = color || model['colors'][ model['default_color'] ] || '';
  //       else
  //         color = color || '';

  //       $location.path('');
  //       parentScope.appEnginePadding = 0;
  //       parentScope.fullScreenLoadingIndicator = true;

  //       console.log('pcFile:', pcFile);
  //       $timeout(function () {
  //         if (spawnNew) bngApi.sendGameEngine('spawnVehicle();');
  //         bngApi.sendGameEngine('chooseVehicle("' + model.key + '", "' + pcFile + '", "' + color + '");');
  //         parentScope.fullScreenLoadingIndicator = false;
  //         d.resolve();
  //       }, 400);

  //       return d.promise;
  //     }
  //   };

  //   return service;
  // }])


  .controller('VehicleSelectController', ['bngApi', 'InstalledMods', function(bngApi, InstalledMods) {


    var vm = this;
    // vm.info = VehiclesInfo;
    vm.info = InstalledMods.vehicles;
    // vm.filters = angular.copy(VehicleFilters.filters);

    // console.log('the vehicles:', VehiclesInfo);
    // console.log('filters:', VehicleFilters);

    vm.tilesOrder = function (vehicle) {
      return vehicle['Type'] + vehicle['key'];
    };

    // vm.selectDefaultConfig = function (model) {
    //   Vehicles.addToGame(model, null, null, false, $scope.$parent);
    // };

    // vm.toDetailsScreen = function (model) {
    //   $location.path('/vehicleselect/' + model['key']);
    // };

    // vm.userFilters = function () {
    //   return function (model, index, array) {

    //     if (model['aggregates'].hasOwnProperty('Years')) {

    //       var inDateRange = model['aggregates']['Years'].min <= vm.filters['Years'].max && 
    //                         model['aggregates']['Years'].max >= vm.filters['Years'].min;
    //       if (!inDateRange) return false;
    //     }

    //     for (var filterId in vm.filters) {
    //       if (model['aggregates'].hasOwnProperty(filterId)) {
    //         // if (filterId == 'Years') {
    //         //   return
    //         //     (model['aggregates']['Years'].min > filters['Years'].min || -1e6) &&
    //         //     (model['aggregates']['Years'].max < filters['Years'].max || 1e6)
    //         // }

    //         var isOk = false;
             
    //         for (var propertyValue in model['aggregates'][filterId]) {
    //           isOk = isOk || vm.filters[filterId][propertyValue];
    //           // if (! vm.filters[filterId][propertyValue])
    //           //   return false;
    //         }
            
    //         if (!isOk) return false;
    //       }
    //     }

    //     return true;
    //   }
    // };

    vm.removeFilters = function () {
      vm.filters = angular.copy(VehicleFilters.filters);
      // for (var filt in vm.filters)
      //   for (var option in vm.filters[filt])
      //     vm.filters[filt][option] = true;
    };
  }])





  // .directive('vehicleFilter', function () {
  //   return {
  //     restrict: 'E',
  //     templateUrl: 'modules/vehicleselect/vehicle-filter.html',
  //     scope: {
  //       title: '@',
  //       items: '=',
  //       defaultOpen: '@'
  //     },
  //     replace: true,
  //     controller: ['$scope', '$attrs', function ($scope, $attrs) {
  //       // $scope.showContents = $scope.$eval($attrs.defaultOpen);
  //       $scope.showContents = $scope.$eval($scope.defaultOpen);
  //       $scope.toggleContents = function () {
  //         $scope.showContents = !$scope.showContents;
  //       };
  //     }]
  //   };
  // })







  // .controller('VehicleDetailsController', 
  //       ['$location', '$scope', '$routeParams', '$timeout', 'bngApi', 'Vehicles', 'VehicleFilters', 'VehiclesInfo',
  //   function ($location, $scope, $routeParams, $timeout, bngApi, Vehicles, VehicleFilters, VehiclesInfo) {
  //   /* COMPATIBILITY W/ HELL */
  //   // set up the display
  //   $scope.selectedMenu = '#/vehicleselect';  // This should not have any meaning. Does it??
  //   $scope.$parent.showDashboard = true;      // Accessing parent scope???? Super-dangerous! This should be handled by an independent service (if at all)
  //   $scope.$parent.appEnginePadding = $scope.$parent.menuWidth; // It will go away eventually, but really?
  //   $scope.navClass = 'deletemeplease';
  //   /* --------------------- */

  //   var vm = this;

  //   vm.info       = VehiclesInfo.list[ VehiclesInfo.index[$routeParams.modelName] ];
  //   vm.hasConfigs = Object.keys(vm.info.configs).length > 1
  //   vm.selected   = {};

  //   vm.vehicleColor = {
  //     name: '',
  //     value: ''
  //   };

  //   vm.tableKeys = Object.keys(VehicleFilters.filters);
  //   var yearsIndex = vm.tableKeys.indexOf('Years');
  //   if (yearsIndex > -1) vm.tableKeys.splice(yearsIndex, 1);

  //   // ------------------- CONFIG SELECTION ------------------------------------

  //   var tileClicks = 0;

  //   vm.selectConfig = function (config) {
  //     tileClicks += 1;

  //     console.log('selecting', config);
  //     vm.selected = angular.copy( vm.info.configs[config] || vm.info );
  //     vm.selected.key = config;
  //     if (vm.selected.hasOwnProperty('default_color'))
  //       vm.vehicleColor = { name: vm.selected['default_color'], value: vm.info.colors[ vm.selected['default_color'] ] };

  //     if (tileClicks == 1) {
  //       $timeout(function () {
  //         if(tileClicks > 1)
  //           vm.applySelection(false);
  //         tileClicks = 0;
  //       }, 300);
  //     }

  //   };

  //   vm.applySelection = function (spawnNew) {
  //     console.log('spawning', vm.selected.key);
  //     Vehicles.addToGame(vm.info, vm.selected.key, vm.vehicleColor.value, spawnNew, $scope.$parent);
  //   }

  //   vm.backToModels = function () {
  //     $location.path('/vehicleselect');
  //   };

  //   // ------------------- COLOR SELECTION ------------------------------------

  //   vm.editColor = false; // Let the users define their own colors

  //   vm.selectColor = function (colorKey) {
  //     vm.vehicleColor.name  = colorKey;
  //     vm.vehicleColor.value = vm.info['colors'][colorKey];
  //   };

  //   // Called when the preset-colors select is opened.
  //   // Must have a $timeout wrapper for some reason (probably fixed in later versions).
  //   vm.getPresetColor = function () {
  //     return $timeout(function () {
  //       vm.editColor = false;
  //     }, 0);
  //   };


  //   if (vm.info.colors) {
  //     $scope.$watch(function () {
  //       return vm.vehicleColor.value;
  //     }, function (newVal, oldVal) {
  //       if (vm.editColor && newVal != oldVal)
  //         vm.vehicleColor.name = 'Custom';
  //     });
  //   }


  //   vm.colorStringToRgba = function (colorString) {
  //     var values = colorString.split(' ').map(function (x) { return parseFloat(x); });
  //     var r = Math.round(255*values[0])
  //       , g = Math.round(255*values[1])
  //       , b = Math.round(255*values[2])
  //       , a = values[3] / 2.0;

  //     return 'rgba(' + [r, g, b, a].join(',') + ')';
  //   };

  //   // run on load: have the default configuration pre-selected
  //   vm.selectConfig(vm.info['default_pc'] || '');

  // }]);

