// (function() {
// 'use strict';

// angular
// .module('MainMenu', [])
// .config(['$routeProvider', function($routeProvider) {
//   $routeProvider
//     .when('/mainmenu', {
//       templateUrl: 'modules/mainmenu/mainmenu.html',
//       controller: 'MainMenuController'
//     });
// }])
angular.module('beamng.stuff')

.controller('MainMenuController', ['$log', '$scope', '$http', '$sce', function($log, $scope, $http, $sce) {
  if ($scope.initialized) {return; } // only run once
  var intervalID;
  $scope.$on('$destroy', function() {
    if (intervalID) { // works becuas var intervalID only sets it do undefined
      window.clearInterval(intervalID);
    }
    // HookManager.unregisterAll(hookObj);
  });

  $scope.openLevel = function() {
    window.location.hash = '#/levelselect/' + $scope.currentEntry[1];
  };

  function randomNumbers(size) {
    var perm = [];
    var i, j, ex;
    for (i = 0; i < size; i++) {
      perm[i] = i;
    }

    for (i = size - 1; i >= 0; i--) {
      j = (Math.random() * i) | 0;
      ex = perm[j];
      perm[j] = perm[i];
      perm[i] = ex;
    }

    return perm;
  }

  function onVersionInfo(data) {
    $scope.$apply(function() { $scope.versionStr = data.version; $scope.buildInfoStr = data.buildinfo; });
  }

  function onSteamInfo(data) {
    $scope.$apply(function() { $scope.steamData = data; });
  }

  beamng.requestVersionInfo();
  beamng.requestSteamInfo();
  //updateChangelog();

  function onHardwareInfo(data) {
    //console.log('onHardwareInfo', data)
    $scope.$apply(function() {
      $scope.hwinfo = data;
    });
  }

  // var hookObj = {
  //   onSteamInfo: onSteamInfo,
  //   onVersionInfo: onVersionInfo,
  //   onHardwareInfo: onHardwareInfo,
  // };

  // HookManager.registerAllHooks(hookObj);

  $scope.$on('SteamInfo', function (event, data) {
    $log.debug('[mainmenu.js] received SteamInfo:', data);
    onSteamInfo(data);
  });

  $scope.$on('VersionInfo', function (event, data) {
    $log.debug('[mainmenu.js] received VersionInfo', data);
    onVersionInfo(data);
  });

  $scope.$on('HardwareInfo', function (event, data) {
    $log.debug('[mainmenu.js] received HardwareInfo', data);
    onHardwareInfo(data);
  });

  // $scope.selectedMenu = '#/mainmenu';
  // $scope.navClass = 'contentNavMainmenu';
  // $scope.$parent.showDashboard = true;
  // $scope.initialized = true;

  $scope.openPerformance = function() {
    window.location.hash = '#/help/4';
  };


  beamng.sendEngineLua('hardwareinfo.requestInfo()');

  var images = [
    'modules/mainmenu/1.jpg',
    'modules/mainmenu/2.jpg',
    'modules/mainmenu/3.jpg',
    'modules/mainmenu/4.jpg',
    'modules/mainmenu/5.jpg',
    'modules/mainmenu/6.jpg',
    'modules/mainmenu/7.jpg',
    'modules/mainmenu/8.jpg',
    'modules/mainmenu/9.jpg',
    'modules/mainmenu/10.jpg',
    'modules/mainmenu/11.jpg',
    'modules/mainmenu/12.jpg',
    'modules/mainmenu/13.jpg',
    'modules/mainmenu/14.jpg',
    'modules/mainmenu/15.jpg'
  ];

  var ranArr = randomNumbers(images.length);

  $scope.images = ranArr.map(function(elem) {return images[elem];});

  /**
    with lots of thanks used from http://codepen.io/peterwestendorp/pen/LbiwD
  */

  /**
 * See: http://www.css-101.org/articles/ken-burns_effect/css-transition.php
 */

  /**
   * The idea is to cycle through the images to apply the "fx" class to them every n seconds.
   * We can't simply set and remove that class though, because that would make the previous image move back into its original position while the new one fades in.
   * We need to keep the class on two images at a time (the two that are involved with the transition).
   */
  angular.element(document).ready(function() {
    (function() {
      // We set the 'fx' class on the first image when the page loads
      document.getElementById('slideshow').getElementsByTagName('div')[0].className = 'fx';

      // this calls the kenBurns function every 6 seconds
      // you can increase or decrease this value to get different effects
      intervalID = window.setInterval(kenBurns, 6000);

      // the third variable is to keep track of where we are in the loop
      // if it is set to 1 (instead of 0) it is because the first image is styled when the page loads
      var images = document.getElementById('slideshow').getElementsByTagName('div'),
          numberOfImages = images.length,
          i = 1;

      function kenBurns() {
        // console.log('picture', i);
        if (i === numberOfImages) { i = 0;}
        images[i].className = 'fx';

        // we can't remove the class from the previous element or we'd get a bouncing effect so we clean up the one before last
        // (there must be a smarter way to do this though)
        if (i === 0) { images[numberOfImages - 2].className = '';}
        if (i === 1) { images[numberOfImages - 1].className = '';}
        if (i > 1) { images[i - 2].className = '';}
        i++;
      }
    })();
  });

  // api: http://api.steampowered.com/ISteamWebAPIUtil/GetSupportedAPIList/v0001/?format=json
  $http.get('http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?format=json&appid=284160&feeds=steam_community_announcements&count=1').
  success(function(data) {
    // console.log(arguments);
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


}

]);

// })();

