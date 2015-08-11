// (function() {
// 'use strict';

// var basePath = '/levels/';

// angular
// .module('Levelselect', ['ngMaterial', 'beamngApi', 'MenuServices'])
// .config(['$routeProvider', 'dashMenuProvider', function($routeProvider, dashMenuProvider) {
//   $routeProvider
//     .when('/levelselect/', {
//       templateUrl: 'modules/levelselect/levelselect.html',
//       controller: 'LevelselectController',
//       controllerAs: 'levels',
//       resolve: {
//         levelsList: ['$q', '$route', 'bngApi', 'InstalledMods', function ($q, $route, bngApi, InstalledMods) {
//           var d = $q.defer();
          
//           if ($route.current.params.hasOwnProperty('reload') && parseInt($route.current.params.reload) > 0) {
//             console.log('in here!');
//             bngApi.engineLua('levels.getList()', function (res) {
//               if (res) InstalledMods.levels = res;
//               d.resolve();
//             });
//           } else {
//             d.resolve();
//           }
          
//           return d.promise;
//         }]
//       }
//     });
//  dashMenuProvider.addMenu({hash: '#/levelselect?reload=1', title: 'Levels', icon: 'terrain', order: 40});
// }])





// })();
