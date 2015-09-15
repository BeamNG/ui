angular.module('beamng.stuff')

  /**
   * @ngdoc service
   * @name  beamng.stuff:Vehicles
   * @requires $log
   * @requires $q
   * @requires $rootScope
   * @requires $timeout
   * @requires beamng.stuff:bngApi
   * @requires beamng.stuff:InstalledMods
   *
   * @description Handles all vehicles-related stuff
  **/
  .service('Vehicles', ['$log', '$q', '$rootScope', '$timeout', 'bngApi', 'InstalledMods', 
    function ($log, $q, $rootScope, $timeout, bngApi, InstalledMods) {
      return {
       
        /**
         * @ngdoc method
         * @name  .#populate
         * @methodOf .
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
         * @name .#colorStringToRgba
         * @methodOf .
         * @param {string} colorString A color string parsed by BeamNG's game engine.
         *
         * @description
         * Utility function that converts a color string parsed by the game engine 
         * to rgba format for all other uses.
         *
         * @returns {string} A CSS-readable rgba format equivalent string.
        **/
        colorStringToRgba:  function (colorString) {
          console.log('getting string:', colorString);
          var values = colorString.split(' ').map(function (x) { return parseFloat(x); });
          var r = Math.round(255*values[0])
            , g = Math.round(255*values[1])
            , b = Math.round(255*values[2])
            , a = values[3] / 2.0;

          return 'rgba(' + [r, g, b, a].join(',') + ')';
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

          if (spawnNew) bngApi.engineScript('spawnVehicle();');

          $log.info('launching vehicle %o', { model: model, pcFile: pcFile, color: color, spawnNew: spawnNew });
          
          $rootScope.$broadcast('app:waiting', true);
          $rootScope.$broadcast('MenuToggle');
          $timeout(function () {
            $rootScope.$broadcast('app:waiting', false);
          }, 2000);
          
          setTimeout(function () {
            bngApi.engineScript('chooseVehicle("' + model.key + '", "' + pcFile + '", "' + color + '");');
          }, 200);
        }
      };
  }])


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

    vm.selectConfig = function (config, launch) {
      for (var property in vm.model.configs[config])
        vm.selectedConfig[property] = vm.model.configs[config][property];
      vm.selectedConfig.key = config; // This is originally the key of the *model*, we need configuration related info.
      
      if (vm.selectedConfig['default_color']) {
        vm.selectedColor = vm.model['colors'][ vm.selectedConfig['default_color'] ];
        console.log('getting default color', vm.selectedColor);
      }
      
      $log.debug('selected configuration %s: %o', config, vm.selectedConfig);

      if (launch) vm.launchConfig(false);
    };

    vm.launchConfig = function (spawnNew) {
      Vehicles.addToGame(vm.model, vm.selectedConfig, vm.selectedColor, spawnNew);
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