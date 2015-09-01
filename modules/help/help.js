// (function() {
// 'use strict';

// angular
// .module('Help', ['MenuServices', 'beamngApi'])

// .config(['$routeProvider', 'dashMenuProvider', function($routeProvider, dashMenuProvider) {
//   $routeProvider
//     .when('/help', {
//       templateUrl: 'modules/help/help.html',
//       controller: 'HelpController'
//     })
//     .when('/help/:pageIndex', {
//       templateUrl: 'modules/help/help.html',
//       controller: 'HelpController'
//     });
//   dashMenuProvider.addMenu({hash: '#/help', title: 'Help', icon: 'help', order: 10});
//   dashMenuProvider.addMenu({divider: true, order: 11});
// }])
angular.module('beamng.stuff')

.filter('bytes', function() {
  return function(bytes, precision) {
    if (!bytes) {return '';}
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {return '-';}
    if (typeof precision === 'undefined') {precision = 1;}
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'], number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
  };
})

.controller('HelpController', ['$log', '$scope', '$stateParams', '$timeout', 'bngApi', '$filter', '$http', '$sce',
  function($log, $scope, $stateParams, $timeout, bngApi, $filter, $http, $sce) {
  // set up the display
  $scope.useThemeBackground = true;
  $scope.tabs = [
    {
      // since this is only a temporary solution, // or aparently not
      // please keep in mind there are some links inside of help, that use the index of this list
      title: 'Overview',
      html: 'modules/help/overview.html'
    }, {
      title: 'Quickstart',
      icon: 'call_made',
      des: 'tips on getting started in BeamNG.drive',
      html: 'modules/help/quickstart.html'
    }, {
      title: 'Support',
      icon: 'chat',
      des: 'live help and forum-based support',
      html: 'modules/help/support.html'
    }, {
      title: 'FAQ',
      icon: 'help',
      des: 'answers to common questions',
      html: 'modules/help/faq.html'
    }, {
      title: 'Performance',
      icon: 'memory',
      des: 'tips for optimal PC performance in BeamNG.drive',
      html: 'modules/help/performance.html'
    }, {
      title: 'Keybindings',
      icon: 'gamepad',
      des: 'a list of keyboard controls',
      html: 'modules/help/keybindings.html'
    },
    {
      title: 'Changelog',
      icon: 'content_paste',
      des: 'summary of recent development progress',
      html: 'modules/help/changelog.html'
    }
  ];

  $scope.cards = $scope.tabs.slice(1, $scope.tabs.length);

  $scope.currentView = Number($stateParams.pageIndex) || 0;
  $scope.changeView = function(i) {
    $scope.currentView = i + 1;
  };
  $scope.linkTo = function(location) {
    window.location.hash = location;
  };

  $scope.goTo = function(ref) {
    window.location.hash = ref;
  };

  $scope.$parent.appEnginePadding = $scope.$parent.menuWidth;
  $scope.query = '';

  $scope.cont = {
    info: {
      name: '',
      email: '',
      text: '',
      subject: 'Feedback'
    },
    add: {
      'log': true,
      hws: true
    }
  };

  $scope.bananabenchRunning = false;

  $scope.requestHardwareInfo = function() {
    beamng.sendEngineLua('hardwareinfo.requestInfo()');
  };

  $scope.runPhysicsBenchmark = function() {
    $scope.bananabenchRunning = true;
    beamng.sendEngineLua('hardwareinfo.runPhysicsBenchmark()');
  };

  var recRefHWPromise = {};

  function recRefHW() {
    recRefHWPromise = $timeout(
      function() {
        // console.log('updating hws automatically');
        $scope.requestHardwareInfo();
        recRefHW();
      },
      5000
    );
  }

  $scope.requestHardwareInfo();
  $scope.$watch(
    function(scope) {return scope.currentView; },
    function() {
      if ($scope.currentView === 4) {
        recRefHW();
      } else if (recRefHWPromise !== {}) {
        $timeout.cancel(recRefHWPromise);
      }
    }
  );

  bngApi.engineLua('hardwareinfo.latestBenchmarkExists()', function(res) {
    $scope.$apply(function() {
      $scope.benchmarkExists = res;
      $scope.cont.add.bench = res;
    });
  });

  $scope.bytes = function(bytes, precision) {
    precision = precision || 1;
    var number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision);
  };

  function receivedPreview(data) {
    console.log(data, 'WHOHOOOOO');

    var help = angular.copy(data);

    if (help.hws) {
      help.hws = {
        'CPU': data.hws.cpu.name,
        'Graphics Card': data.hws.gpu.name,
        'Memory used': $filter('bytes')(data.hws.mem.processPhysUsed) + ' / ' +  $filter('bytes')(data.hws.mem.osPhysUsed) + ' of ' + $filter('bytes')(data.hws.mem.osPhysAvailable),
        'Operating System': data.hws.os.shortname
      };
    }

    $scope.$apply(function() {
      $scope.preview = help;
      // WHOHOOOOO!!!! surprise, something very special is going on here
    });
  }

  function onBananaBenchReady(data) {
    console.log(data);
    $scope.$apply(function() {
      $scope.bananabenchRunning = false;
      $scope.bananabench = data;
      $scope.benchmarkExists = true;
      $scope.cont.add.bench = true;
    });
  }

  var hookObj = {
    SupportPreviewChanged: receivedPreview,
    SettingsChanged: onSettingsChanged,
    BananaBenchReady: onBananaBenchReady,
    ActionsChanged: actionsChanged,
    ActionCategoriesChanged: actionCategoriesChanged,
    BindingsChanged: bindingsChanged,
    SteamInfo: onSteamInfo,
    HardwareInfo: onHardwareInfo
  };

  for (var key in hookObj) {
    $scope.$on(key, function (event, data) {
      $log.debug('[help.js] received' + key +' :', data);
      hookObj[key]();
    });
  }
 
  bngApi.sendEngineLua('settings.requestState()');

  function onSettingsChanged(data) {
    $scope.$apply(function() {
      $scope.settings = data.values;
    });
  }

  $scope.resetFields = function() {
    $scope.cont['info'] = {subject: 'Feedback', email: ''};
  };

/*
// this broke everything :|
  $scope.$watch(
    function(scope) { return scope.cont;},
    function() {$scope.formChanged();},
    true
  );

  $scope.formChanged = function() {
    // Needed since typing in an angular input field and then removing ervery tiped cahracter sets the field to undefined not empty string
    // and serialize to lua does not like undefined properties
    var help = angular.copy($scope.cont);
    help.info.name = help.info.name || '';
    help.info.email = help.info.email || '';
    help.info.text = help.info.text || '';

    // window.sessionStorage.setItem('helpSupportForm', JSON.stringify($scope.cont));
    //save data as cookie, so if module is changed will be saved anyway

    console.log('input just changed it\'s status to "In a relationship"');

    // give $scope.cont.info to lua somehow
    // console.log(bngApi.serializeToLua($scope.cont), $scope.cont)
    bngApi.sendEngineLua('supportForm.recieve(' +  bngApi.serializeToLua(help) + ')');
  };
  $scope.sendForm = function() {
    // Bla, tell lua to send the stuff and the user to make a swoosh sound
    // console.log('send');
    bngApi.sendEngineLua('supportForm.send(' +  bngApi.serializeToLua($scope.cont) + ')');
  };
*/

  $scope.userLogedInSteam = function() {
    return $scope.steamData && $scope.steamData.working && $scope.steamData.loggedin && $scope.steamData.playerName !== undefined;
  };

  var init = true;

  function onSteamInfo(data) {
    // var help = JSON.parse(window.sessionStorage.getItem('helpSupportForm')) || $scope.cont;
    $scope.steamData = data;
    //console.log(data);
    if (init) {
      init = false;
      $scope.cont.add.steam = $scope.userLogedInSteam();
    }
    if ($scope.userLogedInSteam() && $scope.cont.add.steam) {
      $scope.cont.info.name = data.playerName;
    } else {
      $scope.cont.add.steam = false;
    }
    $scope.$apply();
    // $scope.cont = help;
  }

  function onHardwareInfo(data) {
    //console.log('onHardwareInfo', data)
    $scope.$apply(function() {
      $scope.hwinfo = data;
    });
  }

  $scope.changeProp = function(prop, bool) {
    bool = (bool === undefined ? true : bool);
    return (bool ? !prop : prop);
  };

  $scope.requestSteamInfoscope = function() {
    if (typeof beamng !== 'undefined') {
      beamng.requestSteamInfo();
    }
  };
  $scope.requestSteamInfoscope();

  $scope.subjects = ['Feedback', 'Problem', 'Performance', 'Other'];

  beamng.sendEngineLua('bindings.requestState()');
  function actionCategoriesChanged(data) {
    $scope.actionCategories = data;
  }
  function actionsChanged(data) {
    $scope.actions = data;
  }
  function bindingsChanged(data) {
    var kbdkeys = [];
    for (var d = 0; d < data.length; ++d) {
      if (data[d].devname != 'keyboard0') {
        continue;
      }
      for (var i = 0; i < data[d].contents.bindings.length; ++i) {
        var b = data[d].contents.bindings[i];

        if (!$scope.actions[b.action]) {
          //console.log("unknown action: " + b.action);
          continue;
        }
        var ac = $scope.actions[b.action];

        if (ac.desc.indexOf('deprecated') !== -1) {
          continue;
        }

        var foundCID = -1;
        for (var ii = 0; ii < kbdkeys.length; ++ii) {
          if (kbdkeys[ii].cat == ac.cat) {
            foundCID = ii;
            break;
          }
        }
        if (foundCID == -1) {
          var dd = [];
          dd.cat = ac.cat;
          dd.roder = 999;
          if ($scope.actionCategories[ac.cat]) {
            dd.title = $scope.actionCategories[ac.cat].title;
            dd.order = $scope.actionCategories[ac.cat].order;
            dd.desc = $scope.actionCategories[ac.cat].desc;
          }
          kbdkeys.push(dd);
          foundCID = kbdkeys.length - 1;
        }

        var foundID = -1;
        for (var iii = 0; iii < kbdkeys[foundCID].length; ++iii) {
          if (kbdkeys[foundCID][iii].action == b.action) {
            foundID = iii;
            break;
          }
        }

        var key = b.control.split(' ');
        // convert "NUMPADMINUS" to "NUMPAD" "MINUS"

        if (key[key.length - 1].toLowerCase().indexOf('numpad') >= 0) {
          key[key.length - 1] = 'Numpad - ' + key[key.length - 1].substr(6);
        }

        if (foundID == -1) {
          var di = ac;
          di.action = b.action;
          di.bindings = [];
          di.bindings.push(key);
          kbdkeys[foundCID].push(di);
        } else {
          kbdkeys[foundCID][foundID].bindings.push(key);
        }
      }
      break;
    }
    // console.table(kbdkeys[1])
    // console.log(kbdkeys);
    $scope.$apply(function() {
      $scope.bindings = data;
      $scope.kbdkeys = kbdkeys;
    });
  }

  $http.get('http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?format=json&appid=284160&feeds=steam_community_announcements').
  success(function(data) {
    // console.log(arguments);
    // console.log(data.appnews.newsitems);
    $scope.changelogExists = true;

    $scope.changelog = data.appnews.newsitems.map(function(elem) {
      elem.html = $sce.trustAsHtml(parseBBCode(elem.contents));
      elem.date = convertTimestamp(elem.date);
      return elem;
    });
  }).
  error(function() {
    // console.log(arguments);
    $scope.changelogExists = false;
  });

  // bug: prevent JS console errors
  window.updateActions = function() {};
  window.updateBindings = function() {};

  $scope.$on('$destroy', function() {
    if (recRefHWPromise !== {}) {
      $timeout.cancel(recRefHWPromise);
    }
    HookManager.unregisterAll(hookObj);
  });

}]);

// })();
