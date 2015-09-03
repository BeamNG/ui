angular.module('beamng.stuff', ['ngAnimate']);

angular.module('BeamNG.ui', ['ngMaterial', 'ngAnimate', 'ui.router', 'beamng.stuff', 'beamng.apps', 'vAccordion', 'pascalprecht.translate'])  
  
.filter('bytes', function() {
  return function(bytes, precision) {
    if(!bytes) return '';
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {return '-';}
    if (typeof precision === 'undefined') {precision = 1;}
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'], number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
  };
})

.config(['$compileProvider', '$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$translateProvider',
  function($compileProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider, $translateProvider) {
 
  $translateProvider.useStaticFilesLoader({
    prefix: 'locales/',
    suffix: '.json'
  });
  $translateProvider.useSanitizeValueStrategy('escaped');
  $translateProvider.preferredLanguage('en_US');
  $translateProvider.fallbackLanguage('en_US');

  //$translateProvider.use('de_DE');

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

    .state('menu.help', {
      url: '/help:pageIndex',
      templateUrl: 'modules/help/help.html',
      controller: 'HelpController'
    })

    .state('menu.mods', {
      url: '/modemanager',
      templateUrl: 'modules/modmanager/modmanager.html',
      controller: 'HelpController'
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



.controller('AppCtrl', ['$document', '$log', '$scope', '$state', '$mdToast', 'bngApi', '$translate',
  function($document, $log, $scope, $state, $mdToast, bngApi, $translate) {  
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
      { translateid: 'dashboard.levels',      icon: 'terrain',        state: 'menu.levels'     },
      { translateid: 'dashboard.environment', icon: 'cloud_queue',    state: 'menu.environment'},
      { translateid: 'dashboard.scenarios',   icon: 'directions',     state: 'menu.scenarios'  },
      { translateid: 'dashboard.vehicles',    icon: 'directions_car', state: 'menu.vehicles'   },
      { translateid: 'dashboard.options',     icon: 'tune',           state: 'menu.options'    },
      { translateid: 'dashboard.debug',       icon: 'bug_report',     state: 'menu.debug'      },
      { translateid: 'dashboard.feedback',    icon: 'gesture',        state: 'menu.feedback'   },
      { translateid: 'dashboard.apps',        icon: 'apps',           state: 'menu.apps'       },
      { translateid: 'dashboard.photomode',   icon: 'photo_camera',   state: 'photomode'       },
      { translateid: 'dashboard.credits',     icon: 'people',         state: 'credits'         },
      { translateid: 'dashboard.vehicleconfig', icon: 'settings_applications', state: 'menu.vehicleconfig' },
      { translateid: 'dashboard.help',        icon: 'help', state: 'menu.help' },
      { translateid: 'dashboard.mods',        icon: 'help', state: 'menu.mods' }
      // { translateid: 'dashboard.controls', icon: 'games', state: 'menu.controls' }
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

  // **************************************************************************
  // language switching tests
  // var langid = 0;
  // var lang_available = ['en_US', 'de_DE', 'el'];
  // function toggle_lang_example() {
  //   langid++;
  //   if(langid >= lang_available.length) langid = 0;
  //// console.log('switched language to: ', lang_available[langid]);
  //   $scope.$apply(function() {
  //     $translate.use(lang_available[langid]);
  //   });
  //   setTimeout(toggle_lang_example, 3000);
  // }
  // toggle_lang_example();
  // **************************************************************************

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

function parseBBCode(text) {
    text = text.replace(/\[url=http:\/\/([^\s\]]+)\](.*?(?=\[\/url\]))\[\/url\]/gi, '<a href="http-external://$1">$2</a>');
    text = text.replace(/\[forumurl=http:\/\/([^\s\]]+)\](\S*?(?=\[\/forumurl\]))\[\/forumurl\]/gi, '<a href="http-external://$1">$2</a>');
    text = text.replace(/\[url\]http:\/\/(.*?(?=\[\/url\]))\[\/b\]/gi, '<a href="http-external://$1">$1</a>');
    text = text.replace(/\[ico=([^\s\]]+)\s*\](.*?(?=\[\/ico\]))\[\/ico\]/gi, '<img src="images/icons/$1.png">$2</a>');
    text = text.replace(/\[h1\](.*?(?=\[\/h1\]))\[\/h1\]/gi, '<h4>$1</h4>');
    text = text.replace(/\[img\](.*?(?=\[\/img\]))\[\/img\]/gi, '<img src="$1"></img>');
    text = text.replace(/\[list\]\r\n/gi, '<ul>');
    text = text.replace(/\[\/list\]/gi, '</ul>');
    text = text.replace(/\[olist\]/gi, '<ol>');
    text = text.replace(/\[\/olist\]/gi, '</ol>');
    text = text.replace(/\[\*\](.*?(?=\r))\r\n/gi, '<li>$1</li>');
    text = text.replace(/\[b\](.*?(?=\[\/b\]))\[\/b\]/gi, '<b>$1</b>');
    text = text.replace(/\[u\](.*?(?=\[\/u\]))\[\/u\]/gi, '<u>$1</u>');
    text = text.replace(/\[s\](.*?(?=\[\/s\]))\[\/s\]/gi, '<s>$1</s>');
    text = text.replace(/\[i\](.*?(?=\[\/i\]))\[\/i\]/gi, '<i>$1</i>');
    text = text.replace(/\[strike\](.*?(?=\[\/strike\]))\[\/strike\]/gi, '<s>$1</s>');
    text = text.replace(/\[ico=([^\s\]]+)\s*\]/gi, '<img class="ico" src="images/icons/$1.png"/>');
    text = text.replace(/\[code\](.*?(?=\[\/code\]))\[\/code\]/gi, '<span class="bbcode-pre">$1</span>');
    text = text.replace(/\[br\]/gi, '</br>');
    text = text.replace(/\n\n/gi, '<br/>');
    text = text.replace(/\n/gi, '');
    return text;
  }

function convertTimestamp(stamp) {
  return new Date(stamp * 1000).toDateString();
}