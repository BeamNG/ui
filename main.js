angular.module('beamng.stuff', ['ngAnimate']);

angular.module('BeamNG.ui', ['ngMaterial', 'ngAnimate', 'ui.router', 'beamng.stuff', 'beamng.apps'])  
  
.config(['$compileProvider', '$stateProvider', '$urlRouterProvider', '$mdThemingProvider', 
  function($compileProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider) {
 
  // ..... User Interface states
  $stateProvider

  .state('menu', {
    url: '/menu',
    templateUrl: 'menu.html'
  })

    // // Transition to this state is handled by some unknown dark force (Torque?).
    // // Until this chanages, keep the url hash to "mainmenu".
    // .state('mainmenu', {
    //   url: '/mainmenu',
    //   templateUrl: 'modules/mainmenu/mainmenu.html',
    //   controller:  'MainMenuController as mainmenu'
    // })

    .state('menu.levels', {
      url: '/levels',
      templateUrl: 'modules/levelselect/levelselect.html',
      controller:  'LevelSelectController as levels',
      resolve: {
        levelsList: ['$q', 'bngApi', 'InstalledMods',  function ($q, bngApi, InstalledMods) {
          var d = $q.defer();

          bngApi.engineLua('levels.getList()', function (res) {
            InstalledMods.levels = res;
            d.resolve();
          });
        }]
      }
    })

    .state('menu.environment', {
      url: '/environment', 
      templateUrl: 'modules/environment/environment.html',
      controller:  'EnvironmentController as environment',
      resolve: {
        currentState: ['$q', 'bngApi', function ($q, bngApi) {
          var d = $q.defer();
          bngApi.engineLua('environment.getState()', function (res) { d.resolve(res); });
          return d.promise;
        }]
      }
    })

    .state('menu.scenarios', {
      url: '/scenarios',
      templateUrl: 'modules/scenarioselect/scenarioselect.html',
      controller: 'ScenarioSelectController'
    })

    .state('menu.apps', {
      url: '/apps',
      templateUrl: 'modules/appselect/appselect.html',
      controller: 'AppSelectController as apps',
      resolve: {
        populate: ['$q', 'bngApi', 'InstalledMods', function ($q, bngApi, InstalledMods) {
          var d = $q.defer();
          bngApi.engineLua('apps.getList()', function (response) {
            InstalledMods.apps = response.list;
            d.resolve();
          });
          return d.promise;
        }]
      }
    })

    .state('menu.vehicles', {
      url: '/vehicleselect',
      templateUrl: 'modules/vehicleselect/vehicleselect.html',
      controller: 'VehicleSelectController as vehicles',
      resolve: {
        populate: ['$q', 'bngApi', 'InstalledMods', function ($q, bngApi, InstalledMods) {
          var d = $q.defer();
          bngApi.engineLua('vehicles.getVehicleList()', function (response) {
            console.log('the vehicles:', response);
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
        }] 
      }
    })

    .state('menu.options', {
      url: '/options', 
      templateUrl: 'modules/options2/options2.html',
      controller: 'Options2Controller'
    })

    .state('menu.controls', {
      url: '/controls',
      templateUrl: 'modules/options/options.html',
      controller: 'OptionsController'
    })

    .state('menu.debug', {
      url: '/debug',
      templateUrl: 'modules/debug/debug.html',
      controller:  'DebugController'
    })

    .state('menu.feedback', {
      url: '/feedback',
      templateUrl: 'modules/feedback/feedback.html',
      controller: 'FeedbackController'
    })

    .state('menu.vehicleconfig', {
      url: '/vehicle-config',
      templateUrl: 'modules/vehicleconfig/vehicleconfig.html',
      controller: 'VehicleconfigController'
    })

  // Transition to this state is handled by some unknown dark force (Torque?).
  // Until this chanages, keep the url hash to "loading".
  .state('loading', {
    url: '/loading',
    templateUrl: 'modules/loading/loading.html',
    controller:  'LoadingController as loading'
  })

  .state('photomode', {
    url: '/photo-mode',
    templateUrl: 'modules/photomode/photomode.html',
    controller:  'PhotoModeController as photo',
    resolve: {
      steamStatus: ['$q', 'bngApi', function($q, bngApi) {
        var d = $q.defer();
        bngApi.engineLua('Steam.isWorking', function(res) { d.resolve(res); });
        return d.promise; 
      }]
    }
  })

  .state('credits', {
    url: '/credits',
    templateUrl: 'modules/credits/credits.html',
    controller: 'CreditsController'
  });

  $urlRouterProvider.otherwise('/menu');

  $compileProvider.debugInfoEnabled(false);

  // whitelist for local:// prefix
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|local):/);
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|local):/);



  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('orange')
    .warnPalette('red')
    .backgroundPalette('grey');
}])

.run(['$log', '$rootScope', '$window', '$animate', 'apiCallbacks', function ($log, $rootScope, $window, $animate, apiCallbacks) {

  $animate.enabled(false);
  
  // ..... Define all objects attached directly to the window object here

  $window.HookManager = {
    trigger: function (hookName, data) {
      if (hookName == 'MenuHide') return; // ignore until the autohide feature gets fixed.

      $log.debug('[HookManager] triggered', hookName, 'w/', data);
      $rootScope.$broadcast(hookName, data);
    }
  };

  // This should not be a function attached to the window object, but rather a HookManager event.
  // Until this is done, we just mock up the process.
  $window.updateProgress = function(val, txt) {
    $rootScope.$broadcast('UpdateProgress', {value: Math.floor(100 * val), text: txt });
  };

  $window.bngApiCallback = function(idx, result) {
    apiCallbacks[idx](result);
    apiCallbacks[idx] = undefined;
  };

  $window.sendCompleteObjectState = function (value, txt) {
    console.log('completeObjectState', value, 'and', txt)
  };

  $window.updatePhysicsState = function (value) {
    console.log('got updatePhysicsState w/', value);
  };

}]);


angular.module('beamng.stuff')

.value('InstalledMods', {
  levels:    { index: [], list: [] },
  scenarios: [],
  vehicles:  { index: [], list: [], filters: {} },
  campaigns: [],
  apps: []
})



.controller('LevelSelectController',  ['$location', 'bngApi', 'InstalledMods', function($location,  bngApi,  InstalledMods) {
    var vm = this;
    vm.installed = InstalledMods.levels;

    vm.selected = null;

    vm.select = function (level) {
      vm.selected = level;
    };

    vm.launch = function() {
      bngApi.sendGameEngine('startLevel("' + vm.selected.misFilePath + '");');
    };  
}])



.controller('AppCtrl', ['$document', '$log', '$scope', '$state', '$mdToast', 'bngApi',  
  function($document, $log, $scope, $state, $mdToast, bngApi) {  
  var vm = this;

  vm.showMenu = true;

  // REMOVE THIS!! ------------------------------------
  $scope.$watch(function () {
    return window.location.hash;
  }, function () {
    console.log('HASH CHANGE:', window.location.hash);
  });
  // -------------------------------------------------


  vm.menuEntries = {
    init: [],
    game: [
      { text: 'Levels',      icon: 'terrain',        state: 'menu.levels'     },
      { text: 'Environment', icon: 'cloud_queue',    state: 'menu.environment'},
      { text: 'Scenarios',   icon: 'directions',     state: 'menu.scenarios'  },
      { text: 'Vehicles',    icon: 'directions_car', state: 'menu.vehicles'   },
      { text: 'Options',     icon: 'tune',           state: 'menu.options'    },
      { text: 'Debug',       icon: 'bug_report',     state: 'menu.debug'      },
      { text: 'Feedback',    icon: 'gesture',        state: 'menu.feedback'   },
      { text: 'Apps',        icon: 'apps',           state: 'menu.apps'       },
      { text: 'Photo Mode',  icon: 'photo_camera',   state: 'photomode'       },
      { text: 'Credits',     icon: 'people',         state: 'credits'         },
      { text: 'Vehicle Config', icon: 'settings_applications', state: 'menu.vehicleconfig' }
      // { text: 'Controls', icon: 'games', state: 'menu.controls' }
    ]
  };

  $scope.$on('XIControllerChanged', function (event, data) {
    $log.debug('[AppCtrl] received XIControllerChanged', data);
    $mdToast.show(
      $mdToast.simple()
      .content('XBox controller (dis)connected.')
      .position('top right')
      .hideDelay(5000)
    );
  });


  $scope.$on('MenuToggle', function (event, data) {
    $log.debug('[AppCtrl] received MenuToggle', data);
    vm.showMenu = !vm.showMenu;
    
    if (!vm.showMenu) {
      console.log('going...');
      $state.go('menu');
    };

    $scope.$digest();


    // REMOVE THIS!!! (and bngApi injection)
    var luaCmd = {changes: ['streams'], streams: {escData: 1, engineInfo: 1, sensors: 1}};
    beamng.sendActiveObjectLua('guiUpdate(' + bngApi.serializeToLua(luaCmd) + ')');
    console.log('sent:', bngApi.serializeToLua(luaCmd));
  });

}]);
