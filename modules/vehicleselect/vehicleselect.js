angular.module('beamng.stuff')

  /**
   * @ngdoc service
   * @name  beamng.stuff:Vehicles
   * @description Handles all vehicles-related stuff
  **/
  .service('Vehicles', ['$log', '$q', '$rootScope', '$timeout', 'bngApi', 'InstalledMods', 
    function ($log, $q, $rootScope, $timeout, bngApi, InstalledMods) {
      return {
       
        /**
         * @ngdoc method
         * @name  populate
         * @methodOf beamng.stuff:Vehicles
         * @description Retrieves all the available vehicles using the Lua interface and 
         *              stores the result into InstalledMods.vehicles
         * @returns {promise}
         * @see beamng.stuff:InstalledMods
        **/
        populate: function () {
          var d = $q.defer();
          
          bngApi.engineLua('vehicles.getVehicleList()', function (response) {
            $log.debug('vehicles.getList() response:', response);
            if (response) {
              InstalledMods.vehicles.index = response.index;
              InstalledMods.vehicles.list  = response.list;
              for (var f in response.filters) {
                if (InstalledMods.vehicles.filters[f]) continue;
                else InstalledMods.vehicles.filters[f] = response.filters[f];
              }
            }
            d.resolve();
          });

          return d.promise;
        },

        /**
         * @ngdoc method
         * @name addToGame
         * @methodOf beamng.stuff:Vehicles
         * @description Adds a new vehicle to the game
         *
         * @param {object} model
         * @param {string} config
         * @param {string} color
         * @param {boolean} spawnNew Whether to spawn a new vehicle into game instead of replacing the current
        **/
        addToGame: function (model, config, color, spawnNew) {
          $log.debug('got', model, config, color, spawnNew);
          var d = $q.defer()
            , pcFile = ['vehicles', model.key, config || model['default_pc'] || ''].join('/') + '.pc';

          if (!color) {
            if (model['colors']) color = model['colors'][ model['default_color'] ] || '';
            else color = '';
          }

          // if (spawnNew) bngApi.sendGameEngine('spawnVehicle();');
          if (spawnNew) bngApi.engineScript('spawnVehicle();');

          $log.info('launching vehicle %o', { model: model, pcFile: pcFile, color: color, spawnNew: spawnNew });
          
          $rootScope.$broadcast('app:waiting', true);
          $rootScope.$broadcast('MenuToggle');
          $timeout(function () {
            $rootScope.$broadcast('app:waiting', false);
          }, 2000);
          
          setTimeout(function () {
            // bngApi.sendGameEngine('chooseVehicle("' + model.key + '", "' + pcFile + '", "' + color + '");');
            bngApi.engineScript('chooseVehicle("' + model.key + '", "' + pcFile + '", "' + color + '");');
          }, 200);
        }
      };
  }])


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

  /**
   * @ngdoc controller
   * @name  beamng.stuff:VehicleDetailsController
   * @description 
  **/
  .controller('VehicleDetailsController', ['$log', '$stateParams', 'bngApi', 'InstalledMods', 'Vehicles',
    function ($log, $stateParams, bngApi, InstalledMods, Vehicles) {

    var vm = this;

    vm.model          = InstalledMods.vehicles.list[ InstalledMods.vehicles.index[$stateParams.model] ];
    vm.hasConfigs     = Object.keys(vm.model.configs).length > 1;
    vm.selectedConfig = angular.copy(vm.model);
    vm.selectedColor  = '';
    vm.detailsKeys    = Object.keys(InstalledMods.vehicles.filters);

    vm.selectConfig = function (config) {
      for (var property in vm.model.configs[config])
        vm.selectedConfig[property] = vm.model.configs[config][property];
      vm.selectedConfig.key = config; // This is originally the key of the *model*, we need configuration related info.
      
      if (vm.selectedConfig['default_color'])
        vm.selectedColor = vm.model['colors'][ vm.selectedConfig['default_color'] ];
      
      $log.debug('selected configuration %s: %o', config, vm.selectedConfig);
    };

    vm.launchConfig = function (config, spawnNew) {
      vm.selectConfig(config);
      Vehicles.addToGame(vm.model, config, vm.selectedColor, spawnNew);
    };

    if (vm.model['default_pc']) vm.selectConfig(vm.model['default_pc']);

    $log.log('model:', vm.model);
    $log.log('selectedConfig:', vm.selectedConfig);
  }])

  /**
   * @ngdoc controller
   * @name  VehicleSelectController
   * @description
  **/
  .controller('VehicleSelectController', ['$log', 'bngApi', 'InstalledMods', 'Vehicles', function ($log, bngApi, InstalledMods, Vehicles) {

    var vm = this;

    vm.data = angular.copy(InstalledMods.vehicles);
    vm.selected = null;

    vm.tilesOrder = function (vehicle) {
      return vehicle['Type'] + vehicle['key'];
    };

    vm.launchDefaultConfig = function (model) {
      Vehicles.addToGame(model, null, null, false);
    };


    vm.userFilters = function () {
      return function (model, index, array) {

        if (model['aggregates'].hasOwnProperty('Years')) {

          var inDateRange = model['aggregates']['Years'].min <= vm.data.filters['Years'].max && 
                            model['aggregates']['Years'].max >= vm.data.filters['Years'].min;
          if (!inDateRange) return false;
        }

        for (var filterId in vm.data.filters) {
          if (model['aggregates'].hasOwnProperty(filterId)) {
            // if (filterId == 'Years') {
            //   return
            //     (model['aggregates']['Years'].min > vm.data.filters['Years'].min || -1e6) &&
            //     (model['aggregates']['Years'].max < vm.data.filters['Years'].max || 1e6)
            // }

            var isOk = false;
             
            for (var propertyValue in model['aggregates'][filterId]) {
              isOk = isOk || vm.data.filters[filterId][propertyValue];
              // if (! vm.data.filters[filterId][propertyValue])
              //   return false;
            }
            
            if (!isOk) return false;
          }
        }

        return true;
      }
    };

    vm.show = function () {
      console.log('data', vm.data);
    };

    vm.removeFilters = function () {
      vm.data.filters = angular.copy(InstalledMods.vehicles.filters);  
      console.log(vm.data);
    };
  }])





  .directive('vehicleFilter', function () {
    return {
      restrict: 'E',
      templateUrl: 'modules/vehicleselect/vehicle-filter.html',
      scope: {
        title: '@',
        items: '=',
        defaultOpen: '@'
      },
      replace: true,
      controller: ['$scope', '$attrs', function ($scope, $attrs) {
        // $scope.showContents = $scope.$eval($attrs.defaultOpen);
        $scope.showContents = $scope.$eval($scope.defaultOpen);
        $scope.toggleContents = function () {
          $scope.showContents = !$scope.showContents;
        };
      }]
    };
  })







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

