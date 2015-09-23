angular.module('beamng.stuff')

/**
 * @ngdoc constant
 * @name beamng.stuff:Contributors
 * @description Everyone & everything contributed to BeamNG.drive
**/
.constant('Contributors', [
  { translateId: 'credits.programmers', 
    members: [
      {first: 'Thomas',   last: 'Fischer',           aka: 'tdev'},
      {first: 'Lefteris', last: 'Stamatogiannakis',  aka: 'estama'},
      {first: 'Luis',     last: 'Anton Rebollo',     aka: 'Souga'},
      {first: 'Mirco',    last: 'Weigel',            aka: 'theshark'},
      {first: 'Ben',      last: 'Payne',             aka: ''},
      {first: 'Bruno',    last: 'Gonzalez',          aka: 'stenyak'},
      {first: 'Xiaoyi',   last: 'Wang',              aka: ''},
      {first: 'Matti',    last: 'Yrjänheikki',       aka: 'Masa'}
    ]
  },

  { translateId: 'credits.vehicleDesigners', 
    members: [
      {first: 'Gabe',          last: 'Fink',       aka: 'gabester'},
      {first: 'Mitchell',      last: 'Sahl',       aka: ''},
      {first: 'Corey',         last: 'Bergerud',   aka: ''},
      {first: 'Sam',           last: 'Millington', aka: 'DrowsySam'},
      {first: 'Ananda Neelam', last: 'Thathayya',  aka: 'Nadeox1'},
      {first: 'Jali',          last: 'Hautala',    aka: 'Jalkku'},
      {first: 'Jukka',         last: 'Muikkula',   aka: 'Miura'}
    ]
  },

  { translateId: 'credits.environmentArtists',
    members: [
      {first: 'Sam', last: 'Hutchinson', aka: 'LJFHutch'}
    ]
  },

  { translateId: 'credits.customerSupport',
    members: [
      {first: 'Kamil', last: 'Kozak',  aka: ''},
      {first: 'Harm',  last: 'Schulz', aka: ''}
    ]
  },

  { translateId: 'credits.organization', 
    members: [
      {first: 'Saskia',       last: 'Opitz',        aka: ''},
      {first: 'Christoforos', last: 'Lambrianidis', aka: ''}
    ]
  },

  { translateId: 'credits.qa',
    members: [
      {first: 'Safdar',   last: 'Mahmood', aka: ''},
      {first: 'Rajinder', last: '',        aka: ''}
    ]
  },

  { translateId: 'credits.ui',
    members: [
      {first: 'Yale',      last: 'Hartmann',    aka: ''},
      {first: 'Svetlozar', last: 'Valchev',     aka: ''},
      {first: 'Theodoros', last: 'Manouilidis', aka: ''},
      {first: 'Giorgos',   last: 'Siantikos',   aka: 'gntikos'}
    ]
  },

  { translateId: 'credits.ourAwesomeCommunity',
    members: [
      {first: 'Richard',  last: 'Sixsmith',    aka: 'Metalmuncher'},
      {first: 'Tom',      last: 'Verhoeve',    aka: 'Mythbuster'},
      {first: 'Sergy',    last: 'Karpowicz',   aka: '0xsergy'},
      {first: 'Dustin',   last: 'Kutchara',    aka: 'dkutch'},
      {first: 'Matti',    last: 'Yrjänheikki', aka: 'Masa'},
      {first: 'Daniel',   last: 'Jones',       aka: 'daniel_j'},
      {first: 'Vasilis',  last: 'Douvaras',    aka: ''},
      {first: 'Dennis',   last: 'Wrekenhorst', aka: 'Dennis-W'},
      {first: 'Sven',     last: 'Nabeck',      aka: 'sputnik_1'},
      {first: 'Yannis',   last: 'Vaiopoulos',  aka: 'JohnV'},
      {first: 'Kristian', last: 'Fagerland',   aka: ''},
      {first: 'Carlos',   last: 'Bergillos',   aka: 'CarlosAir'}
    ]
  },

  { translateId: 'credits.specialThanksTo',
    members: [
      {first: 'Pierre-Michel', last: 'Ricordel', aka: 'pricorde'}
    ]
  },

  { translateId: 'credits.madePossibleWith',
    members: [
      {first: 'Torque3D',                    last: '', aka: ''},
      {first: 'LuaJIT',                      last: '', aka: ''},
      {first: 'lua-intf, LuaBridge',         last: '', aka: ''},
      {first: 'Chromium Embedded Framework', last: '', aka: ''},
      {first: 'jQuery',                      last: '', aka: ''},
      {first: 'AngularJS',                   last: '', aka: ''},
      {first: 'Material Design',             last: '', aka: ''},
      {first: 'LuaSocket',                   last: '', aka: ''},
      {first: 'Sublime Text',                last: '', aka: ''}
    ]
  }
])

/**
 * @ngdoc controller
 * @name beamng.stuff:CreditsController
 * @requires $log
 * @requires $scope
 * @requires $state
 * @requires beamng.stuff:Contributors
 *
 * @description
 * Basic controller for the credits scene
**/
.controller('CreditsController', ['$log', '$scope', '$state', '$timeout', 'Contributors',
function($log, $scope, $state, $timeout, Contributors) {
  document.getElementById('bng-credits-wrapper').focus();

  var vm = this;
  vm.contributors = Contributors;

  vm.exit = function ($event) { 
    if ($event)
      $log.debug('[CreditsController] exiting by keypress event %o', $event);
    $state.go('menu'); 
  };

  document.getElementsByClassName('bng-credits-content')[0].addEventListener('webkitAnimationEnd', function() {
      vm.timeOutPromise = $timeout(function() {
        vm.exit();
      }, 500);
    });

  $scope.$on('$destroy', function () {
    $log.debug('[CreditsController] destroyed. Clearing timeout %o', vm.timeOutPromise);
    $timeout.cancel(vm.timeOutPromise); 
  });
}]);