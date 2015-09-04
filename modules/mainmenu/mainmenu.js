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

  $scope.selectedMenu = '#/mainmenu';
  $scope.navClass = 'contentNavMainmenu';
  $scope.$parent.showDashboard = true;
  $scope.initialized = true;

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

    // var data = {
    //   "appnews": {
    //     "appid": 284160,
    //     "newsitems": {
    //       "newsitem": [
    //         {
    //           "gid": "424810855074024597",
    //           "title": "Version 0.4.0.6 released",
    //           "url": "http://store.steampowered.com/news/externalpost/steam_community_announcements/424810855074024597",
    //           "is_external_url": true,
    //           "author": "BeamNG",
    //           "contents": "[IMG]http://media.beamng.com/Uw8lqO5dTIKworBX[/IMG]\r\n\r\n[url=http://www.beamng.com/entries/127]You can also read this update in our blog[/url].\r\n\r\n[h1]Features:[/h1]\r\n[LIST]\r\n[*]Improved Performance Helping: Better guidance with performance problems\r\n[*]Ability to disable inter-vehicle collision for low performance systems resulting in nearly doubled performance.\r\n[*]Auto hide dashboard after 15 seconds without focus\r\n[*]Added a years filter to vehicle selector: Allows you to filter vehicles by manufacture date\r\n[*]Added Advanced Mode: Hides some more advanced functions like the debug mode, etc in the user interface by default\r\n[*]Dashboard hiding in UI-Edit: prevents elements being aligned incorrectly\r\n[*]User presets in Colorpicker\r\n[*]Now hiding the Tacho in cockpit mode\r\n[*]Added Bananabench to the game user interface (under Help > Performance)\r\n[*]2-5% physics core speedup\r\n[*]The console application now accepts and forwards command line arguments\r\n[*]The Modmanager can now unpack/pack and open mods for easier mod creation - always backup your files - this feature is work in progress\r\n[/LIST]\r\n\r\n[h1]Bugfixes:[/h1]\r\n[LIST]\r\n[*]Force Feedback working again\r\n[*]The game now tries to create a profile in the Nvidia settings to enforce the usage of the dedicated graphics card\r\n[*]Fixed backward compatibility only working the first time, but not when the game is restarted\r\n[*]Fixed physics stress debug mode\r\n[*]Fix for mods with a space in the folder path\r\n[*]ABS indicator fix\r\n[*]Converted remote controller to an extension, not loaded on startup by default anymore\r\n[*]Fixed luasocket sandbox allowing the 0.0.0.0 broadcast address now\r\n[*]Bananabench: Reduced the error rate by increasing the steps\r\n[*]Fixes for missing hydros in jbeam\r\n[*]Fixed possible problem with background image which rendered the complete game not working\r\n[/LIST]\r\n\r\n[h1]Content:[/h1]\r\n[LIST]\r\n[*]H-Series: Fixed cab instability\r\n[*]Moonhawk: Improved door flexbody spike and deformation, self collision issues, rear bumper jiggle\r\n[*]Vanster: Tweaked driveshaft strength, corrected steering lock, improved off-road tires\r\n[*]D15: Improved off-road tires\r\n[*]200BX: Durability tweaks, windshield mesh error, widebody quarterpanel UV mapping corrected\r\n[*]Tilt Board: Model updates\r\n[*]Gavril T-Series: Jbeam overhaul, improving performance.\r\n[*]Jungle Rock Island: progress (roads, port, tunnels, lighthouse and more)\r\n[*]Skyboxes converted to dds file format\r\n[/LIST]\r\n",
    //           "feedlabel": "Community Announcements",
    //           "date": 1435418332,
    //           "feedname": "steam_community_announcements"
    //         },
    //         {
    //           "gid": "499119164373552010",
    //           "title": "Version 0.4.0.5 released",
    //           "url": "http://store.steampowered.com/news/externalpost/steam_community_announcements/499119164373552010",
    //           "is_external_url": true,
    //           "author": "BeamNG",
    //           "contents": "[IMG]http://media.beamng.com/Pt8ywmLez61NYUAA[/IMG]\r\n\r\n[url=http://www.beamng.com/entries/126]You can also read this update in our blog[/url].\r\n\r\n[h1]Features:[/h1]\r\n[LIST]\r\n[*]Added a mod manager - more info here: [URL]http://www.beamng.com/threads/14209[/URL]\r\n[*]Dashboard is now hidden in the UI Editor, making it easier to position elements\r\n[*]Spacebar now binded to handbrake\r\n[*]Improved Xbox controller inputmap\r\n[*]Slightly faster bindings search\r\n[*]Show last used binding in Controls menu, for quick access\r\n[*]The virtual filesystem (responsible for zip loading) is now case insensitive. This improves backward compatibility a lot.\r\n[/LIST]\r\n\r\n[h1]Bugfixes:[/h1]\r\n[LIST]\r\n[*] Improved backward compatibility for old mods a lot: case insensitive filenames in zips and dynamic mounting into the correct place if the vehilces/ or levels/ folder are missing inside the zip\r\n[*]Disabled advanced debug text drawing by default\r\n[*]Fixed inability to use certain keys for bindings (e.g. space bar)\r\n[*]Fixed Steam taking screenshots with random keys\r\n[*]Fixed inability to modify a binding twice in a row\r\n[*]'Revert' binding button works again\r\n[*]Prevent duplicated bindings in several situations\r\n[*]Added user path fallback if the user path is not writeable\r\n[*]Fixed VSync on startup\r\n[*]Removed unneeded sound providers for now, fixes the XAudio_.dll error.\r\n[*]The launcher will now check if DirectX is installed properly instead of the program failing with \"The application is unable to start correctly\"\r\n[*]Fixed DirectX error messages while in fullscreen: were behind the game\r\n[*]fixed launcher backing up the log files and creating empty folder when there was nothing to back up :|\r\n[*]Disabled automatic writing of updates of materials.cs files when a material is not found and generated on the fly: fixes the random levels/ and vehicles/ folders in the user path\r\n[*] Fixed Force feedback being broken on certain hardware: It tried to send forces to the keyboard ... :| (seriously, FFB on a keyboard?!)\r\n[/LIST]\r\n\r\n[h1]Content:[/h1]\r\n[LIST]\r\n[*]Fixed Skycurve 2 sorting\r\n[*]Added various missing preview images\r\n[*]Converted flares to .dds texture format for performance increase\r\n[*]Jungle Rock Island: Progress on roads\r\n[*]200BX: Added \"custom\" config, ABS for higher trim levels, strut bar, custom wheels & improved bumper deformation\r\n[*]Sunburst: Fixed incorrect collision triangles, improved bumper deformation, improved a-pillar deformation\r\n[*]Grand Marshal: Improved bumper deformation, improved a-pillar deformation\r\n[/LIST]\r\n",
    //           "feedlabel": "Community Announcements",
    //           "date": 1434397342,
    //           "feedname": "steam_community_announcements"
    //         },
    //         {
    //           "gid": "519384546597003936",
    //           "title": "Version 0.4.0.4 released",
    //           "url": "http://store.steampowered.com/news/externalpost/steam_community_announcements/519384546597003936",
    //           "is_external_url": true,
    //           "author": "BeamNG",
    //           "contents": "[IMG]http://media.beamng.com/oyEWL3ICPhjZemJZ[/IMG]\r\n\r\n[url=http://www.beamng.com/entries/125]You can also read this update in our blog[/url].\r\n\r\n[h1]Features:[/h1]\r\n[LIST]\r\n[*] Added Brake Proportioning Valves\r\n[*] Improved AI's path planning\r\n[*] Custom filtering allowed to all kind of controls instead of only axis\r\n[*] Automatically switch to manual gearbox when possible if using a hardware shifter (G27 and alike)\r\n[*] Improved Vehicle Selection\r\n[/LIST]\r\n\r\n[h1]Bugfixes:[/h1]\r\n[LIST]\r\n[*]Fixed a problem causing the game to launch in a higher resolution / refresh rate than the display supports\r\n[*]Fixed V-Sync option not working properly: previosuly your windowed framerate could be higher than the fullscreen one. Please check if your vsync is on/off now.\r\n[*]Fixed a problem with the forest causing stuttering gameplay\r\n[*]Improved imposters generation\r\n[*]Added non-writable user path fallback: If the game cannot write to \"My Documents\" it will choose a folder relative to the installation folder as fallback\r\n[*]Fixed water reflecting debug objects\r\n[*]Fixed a problem causing the 'Controls' screen to become unresponsive or lag\r\n[*]Fix for scroll in the FFB's window for smaller resolutions\r\n[*]Fixed a bug causing Steam to take screenshots with keys not set to do that\r\n[*]Fixed chat usernames not working\r\n[/LIST]\r\n\r\n[h1]Content:[/h1]\r\n[LIST]\r\n[*]Jungle Rock Island: More progress\r\n[*]Bolide: Improved dashboard deformation\r\n[*]Sunburst: Various fixes and improvements\r\n[*]Covet: Fixed collapsing suspension, improved roof stiffness\r\n[*]200BX: Improved roof stiffness and various durability tweaks\r\n[/LIST]",
    //           "feedlabel": "Community Announcements",
    //           "date": 1433735925,
    //           "feedname": "steam_community_announcements"
    //         },
    //         {
    //           "gid": "519383914591647990",
    //           "title": "Version 0.4.0.3 released",
    //           "url": "http://store.steampowered.com/news/externalpost/steam_community_announcements/519383914591647990",
    //           "is_external_url": true,
    //           "author": "BeamNG",
    //           "contents": "[IMG]http://media.beamng.com/0qI8XBv7d4ssDOze[/IMG]\r\n\r\n\r\n[url=http://www.beamng.com/entries/124]You can also read this update in our blog[/url].\r\n\r\n\r\nWe've just released a patch addressing some common issues and crashes :)\r\n\r\n[h1]Bugfixes:[/h1]\r\n[LIST]\r\n[*] Fixed backward compatibility of mods: name.cs file is used now as well as the part configs are working now. Also removed 'unknown' category.\r\n[*] Fixed startup default resolution possibly too big for screen\r\n[*] Fixed screen stuttering in scenarios: Avoiding redundant state changes in rendering\r\n[*]Adding missing runtime DLLs for launcher in case the vcredist failed to install properly\r\n[*] Fixed missing default unit system: defaults to imperial now\r\n[*] Fixed problems with the theme colors\r\n[*] Fixed a crash involving missing decals\r\n[*] Upgraded LuaJIT version: lots of fixes, fixes some Lua memory problems\r\n[*] Fixed issue with xinput where it showed strange messages about missing DLLs to users\r\n[*] Fixed crash on particles upon context switch\r\n[*] Fixed crash on inability to write the imposter texture to disk\r\n[*] Fixed vehicle \"types\" are populated from the actual vehicles.\r\n[*] Fix for an issue with fullscreen toggling\r\n[*] Fixed an issue with the vehicle cache\r\n[*] Improvements to key binder\r\n[*] Added brake information for wheels in GUI streams\r\n[*] Increased the speed of the clutch\r\n[/LIST]\r\n\r\n[h1]Content:[/h1]\r\n[LIST]\r\n[*]Improved performance on JRI by roughly 10%\r\n[*]Completed a new stretch of road on JRI\r\n[*]Added new dirt road textures to JRI\r\n[*]Added new vegetation object to JRI (alternate species of the filler)\r\n[*]Updated old barriers on Derby\r\n[*]Hatch: fixed incorrect deformation of windshield cracks, suspension improvements, pbrake shudder reduced\r\n[*]Added \"vehicle-filter\" to UI selector\r\n[/LIST]",
    //           "feedlabel": "Community Announcements",
    //           "date": 1433251638,
    //           "feedname": "steam_community_announcements"
    //         }
    //       ]
    //     }
    //   }
    // };

    // console.log(arguments)
    // $scope.changelogExists = true;

    // $scope.changelog = data.appnews.newsitems.newsitem.slice(0, 3).map(function(elem) {
    //   elem.html = $sce.trustAsHtml(parseBBCode(elem.contents));
    //   elem.date = convertTimestamp(elem.date);
    //   return elem;
    // });
  });


}

]);

})();

