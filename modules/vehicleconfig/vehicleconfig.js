// (function() {
// 'use strict';

// angular
//   .module('Vehicleconfig', ['ngMaterial', 'beamngApi', 'color', 'file', 'MenuServices'])
//   .config(['$routeProvider', 'dashMenuProvider', function($routeProvider, dashMenuProvider) {
//     $routeProvider
//       .when('/vehicleconfig', {
//         templateUrl: 'modules/vehicleconfig/vehicleconfig.html',
//         controller: 'VehicleconfigController'
//       });
//     dashMenuProvider.addMenu({hash: '#/vehicleconfig', title: 'Mod Vehicle', icon: 'settings_applications', modes: ['play'], order: 25});
//     dashMenuProvider.addMenu({divider: true, modes: ['play'], order: 29});
//   }])

angular.module('beamng.stuff')

  .filter('truncate', function() {
    return function(text, length, end) {
      if (isNaN(length)) {
        length = 10;
      }
      end = end || '...';

      if (text !== undefined && text.length <= length) {
        return text;
      } else {
        return String(text).substring(0, length - end.length) + end;
      }
    };
  })

  .controller('VehicleconfigController', ['$log', '$scope', '$timeout', 'bngApi', function($log, $scope, $timeout, bngApi) {
    //set up the display
    // $scope.selectedMenu = '#/vehicleconfig';
    // $scope.navClass = 'contentNavVehicleconfig';
    // $scope.useThemeBackground = true;
    // $scope.$parent.showDashboard = true;
    // $scope.$parent.appEnginePadding += 400;
    var currentConfig;

    //set up Hookmanager
    //sometimes the hookmanager throws an "Uncaught TypeError: Cannot read property 'trigger' of undefined"
    // var hookObj = {
    //   'onVehicleconfigChange': onVehicleconfigChange,
    //   'onVehicleChange': function() {
    //     loadList();
    //     $scope.onVehicleChangeColor();
    //     currentConfig = $scope.d.data;
    //   },
    //   'onVehicleconfigSaved': loadList
    // };

    // HookManager.registerAllHooks(hookObj);

    $scope.$on('VehicleconfigChange', function (event, data) {
      $log.debug('[vehicleconfig.js] received VehicleconfigChange:', data);
      onVehicleconfigChange(data);
    });

    $scope.$on('VehicleChange', function (event, data) {
      $log.debug('[vehicleconfig.js] received VehicleChange:', data);
      loadList();
      $scope.onVehicleChangeColor();
    });

    $scope.$on('VehicleconfigSaved', function (event, data) {
      $log.debug('[vehicleconfig.js] received VehicleconfigSaved:', data);
      loadList();
    });

    $scope.stopPropagation = function(event) {
      event.stopPropagation();
    };

    //Parts:
    var prefix; //the prefix found by the getPrefix function on load of the config

    // $scope.bla = {'test': '0 0 0 0'};

    // (function blatest (blai) {
    //   $timeout(function() {
    //       $scope.$apply(function() {
    //         $scope.bla['test' + blai] = '' + blai / 50 + ' ' + blai / 50 + ' ' + blai / 50 + ' ' + blai / 50;
    //         if (blai < 50) {
    //           blatest(blai + 1);
    //         }
    //       });
    //     }, 1000);
    // }(10));

    $scope.d = {}; //the data container
    $scope.open = {}; //the object to load open accordions
    $scope.openRuntime = {}; //the object to save open accordions

    $scope.$on('$destroy', function() {
      $scope.selectReset();
      // $scope.$parent.appEnginePadding -= 400;
      // HookManager.unregisterAll(hookObj);
    });

    // Initial data load
    bngApi.sendActiveObjectLua('partmgmt.vehicleResetted()');

    //Highlights the given part
    $scope.selectPart = function(element) { // onmousenter
      bngApi.sendActiveObjectLua('partmgmt.selectPart("' + element + '")');
    };

    // Deselects everything
    $scope.selectReset = function() { // onmouseleave
      bngApi.sendActiveObjectLua('partmgmt.selectReset()');
    };

    // Finds the name of the selected value
    // Used for labeling the md-selects
    $scope.lookupName = function(val, opts) {
      for (var key = 0; key < opts.length; key += 1) {
        if (opts[key].val === val) {
          return opts[key].name;
        }
      }
      return '';
    };

    // Toggles if an accordion is open or not and saves the info to the sessionstorage
    $scope.toggleOpen = function(section) {
      if ($scope.openRuntime[section]) {
        $scope.openRuntime[section] = !$scope.openRuntime[section];
      } else {
        $scope.openRuntime[section] = true;
      }
      saveOpen();
    };

    // Saves the config change made
    $scope.writeVehicleconfig = function() {
      var newConfig = generateConfig($scope.d.data);
      // console.log(newConfig)

      bngApi.sendActiveObjectLua('partmgmt.setConfig(' + bngApi.serializeToLua(newConfig) + ')')
    };

    $scope.resetConfig = function() {
      if (currentConfig !== undefined && typeof currentConfig === 'string') {
        $scope.load(currentConfig);
      } else {
        var newConfig = generateConfig(currentConfig);
        // console.log(newConfig)
        bngApi.sendActiveObjectLua('partmgmt.setConfig(' + bngApi.serializeToLua(newConfig) + ')')
      }
    };

    // Saves the info which accordions where open for each car to the sessionstorage,
    // so that on another load of the page the same accordions are open, but on a relaunch of the game all are closed by default
    function saveOpen () {
      window.sessionStorage.setItem('vehicleconfigOpenSlots' + prefix, JSON.stringify($scope.openRuntime));
    }

    // Tries to load the open object for the current car
    function loadOpen () {
      var open = JSON.parse(window.sessionStorage.getItem('vehicleconfigOpenSlots' + prefix));
      if (open !== null) {
        $scope.openRuntime = ($scope.open = open);
      }
    }

    // intended to be invoked on a generated tree
    // sorts recursively, alphabetically and slots last
    function sort(a, b) {
      if (a.parts) {
        a.parts.sort(sort);
        if (!b.parts) {
          return 1;
        }
      }

      if (b.parts) {
        b.parts.sort(sort);
        if (!a.parts) {
          return -1;
        }
      }

      return a.slot.localeCompare(b.slot); // if both have parts or not, just compare the string
    }

    function onVehicleconfigChange (config) {
      var tree = generateTree(config);
      // sort the tree so the items with parts go last
      // TODO: Think if that's a good idea, because that means things that before had parts and are then set to empty switch places
      tree.sort(sort);

      $timeout(function() {
        $scope.$apply(function() {
          $scope.d.data = tree;
          loadOpen();
        });
      }, 350); //needed because of angulars timeout for the deletion of select menus
    }

    // Generates an Object to be passed to lua of the current config
    function generateConfig (d, res) {
      res = res || {};
      for (var item = 0; item < d.length; item += 1) {
        res[d[item].slot] = d[item].val;
        if (d[item].parts) {
          generateConfig(d[item].parts, res);
        }
      }
      return res;
    }

    // Tries to get the prefix of a list of Names
    // by getting the longest string in that list
    // and then iterating over each char looking if they match for every entry in the list
    // if that is not the case for one char it returns the found prefix
    // if the iteration goes to an end without finding a prefix an empty string is reurned
    function getPrefix(des) {
      var strings = [];
      var prefix = '';

      // converts the associative array to a real one
      for (var k in des) {
        strings[strings.length] = des[k];
      }

      // gets the maximium length of the strings
      var max = Math.max.apply(null, strings.map(function(param) {return param.length;}));

      //tries to find a prefix
      for (var i = 0; i < max; i++) {
        for (k in des) {
          if (des[k].indexOf(prefix) !== 0) {
            return strings[0].substring(0, (i - 2));
          }
        }
        prefix = strings[0].substring(0, i);
      }
      return '';
    }

    // Wrapper function to generate easier to proces data from the laoded config
    function generateTree (data) {
      prefix = getPrefix(data.slotDescriptions);
      return generateTreeHelp(data.slotMap, data.slotDescriptions);
    }

    // Iterates recursivly over the loaded config and returns an object that is easier to acces in angular
    function generateTreeHelp (d, des) {
      var res = [];

      for (var child in d) {
        var slot = d[child];
        var element = {
          name: des[child].replace(prefix, ''),
          slot: slot[0].partType ,
          val: 'none',
          options: [{name: 'Empty', val: 'none'}]
        };

        var help = element.options;
        for (var item = 0; item < slot.length; item += 1) {
          help[help.length] = {name: slot[item].name.replace(prefix, ''), val: slot[item].partName};
          if (slot[item].active) {
            element.val = slot[item].partName;
            if (slot[item].parts) {
              element.parts = generateTreeHelp(slot[item].parts, des);
            }
          }
        }
        res[res.length] = element;
      }
      return res;
    }

    //Color
    $scope.onVehicleChangeColor = function() {
      // console.log('test')
      bngApi.engineScript('getVehicleColor()', function(res) {
        var val = res || 'White';
        $scope.color = val;
      });
    };

    $scope.onVehicleChangeColor();

    $scope.updateColor = function(val) {
      bngApi.sendGameEngine('changeVehicleColor("' + val + '");');
    };

    //Save & Load

    $scope.savename = '';
    $scope.configList = [];
    $scope.saveBtnLabel = 'Save';

    function loadList() {
      bngApi.activeObjectLua('partmgmt.getConfigList()', function(configs) {
        $scope.configList = configs.map(function(elem) {return elem.slice(0, elem.length - 3);});
        $scope.$apply();
      });
    }

    loadList();

    $scope.savenameChange = function(name) {
      $scope.saveBtnLabel = $scope.configList.indexOf(name) != -1 ? 'overwrite' : 'save';
    };

    $scope.save = function(configFilename) {
      // console.log('save the configuration as: ' + name);
      bngApi.sendActiveObjectLua('partmgmt.saveLocal("' + configFilename + '.pc")');
    };
    $scope.load = function(configFilename) {
      currentConfig = configFilename;
      // console.log('load: ' + configFilename);
      bngApi.sendActiveObjectLua('partmgmt.loadLocal("' + configFilename + '.pc")');
    };
  }]);
