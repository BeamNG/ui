(function() {
  'use strict';

  angular
  .module('Repo', ['ngMaterial', 'beamngApi', 'MenuServices'])
  .config(['$routeProvider', 'dashMenuProvider', function($routeProvider, dashMenuProvider) {
    $routeProvider
      .when('/repo', {
        templateUrl: 'modules/repo/repo.html',
        controller: 'RepoController',
        controllerAs: 'repo',

        resolve: {
          projectFiles: function (RepoService) {
            return RepoService.getProjectFiles();
            //return RepoService.getAuthToken().then(function (data) {
            //});
          }
        }


      });
    //dashMenuProvider.addMenu({hash: '#/repo', title: 'Repository', icon: 'get_app', order: 46});
  }])

  .filter('markdown', ['$sce', function($sce) {
    return function(input) {
      return $sce.trustAsHtml(Markdown.toHTML(input));
    };
  }])

  .filter('bytes', function() {
    return function(bytes, precision) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {return '-';}
      if (typeof precision === 'undefined') {precision = 1;}
      var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'], number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    };
  })

  .service('RepoService', ['$http', '$q', function ($http, $q) {
    var baseUrl = 'https://repo.beamng.com';
    var authToken = null;

    var service = {

      getAuthToken: function () {
        return $http({
          method: 'JSONP',
          url: baseUrl + '/s2/v1/gameauth',
          params: {
            callback: 'JSON_CALLBACK'
          }
        })
        .success(function (data) { 
          authToken = data; 
        })
        .error(function (error) { 
          console.log('could not get gameauth', error || 'no error message.'); 
        });
      },


      getProjectFiles: function () {
        var d = $q.defer();

        $http({
          method: 'JSONP',
          url: baseUrl + '/s1/v1/projectfiles/list',
          params: {
            callback: 'JSON_CALLBACK',
            auth: authToken
          }
        })
        .success(function (data) {
          console.log('project files', data);
          d.resolve(data);
        })
        .error(function (error) {
          console.log('error getting project files', error);
          d.reject(error || 'no error message');
        });

        return d.promise;
      },

      downloadFile: function (hash) {
        return $http({
          method: 'JSONP',
          url: baseUrl + '/downloadfile/' + hash,
          headers: {
            'Content-Type': 'application/zip',
            'Accept': 'application/zip'
          }
        })
        .success(function (data) {
          console.log('did it!', data);
        })
        .error(function (error) {
          console.log('error', error || 'no error message');
        });
      }
    };

    return service;
  }])

  .controller('RepoController', ['$scope', '$location', 'bngApi', 'RepoService', 'projectFiles',
    function($scope, $location, bngApi, RepoService, projectFiles) {
    var vm = this;

    vm.projects = projectFiles.projects;
    vm.selected = null;
    vm.downloadState = {};
    $scope.useThemeBackground = true;
    $scope.$parent.showDashboard = false;
    $scope.$on('$destroy', function() {
      $scope.$parent.showDashboard = true;
      // HookManager.unregisterAll(hookObj);
    });

    function onModManagerModsChanged(data) {
      console.log('onModManagerModsChanged: ', data);
      // quick hack: set file status to 'done'
      vm.downloadState = {}
      $scope.$apply(function() {
        for (var fn in data) {

          vm.downloadState[data[fn]] = { percent: '', done: true };
          //vm.downloadState[data[fn]].done = true;
        }
      });
    }
    $scope.removeFile = function(hash) {
      console.log('removeFile: ', hash);
      bngApi.engineLua('modmanager.removeMod("' + hash + '")');
    };

    // var hookObj = {
    //   onModManagerModsChanged: onModManagerModsChanged
    // };

    // HookManager.registerAllHooks(hookObj);
    $scope.$on('onModManagerModsChanged', function (event, data) {
      $log.debug('[repo.js] received onModManagerModsChanged');
      onModManagerModsChanged(data);
    });

    bngApi.engineLua('modmanager.requestState()');

    vm.backToMenu = function () {
      $location.path('/');
    };

    vm.imagePath = function (tag) {
      return 'https://repo.beamng.com/downloadmedia/' + tag + '?view=1&thumb=200';
    };

    /*vm.selectProject = function (index) {
      vm.selected = vm.projects[index];

      vm.downloadState = {};
      for (var i=0; i<vm.selected.files.length; i++) {
        vm.downloadState[vm.selected.files[i].hash] = { percent: '', done: false };
      }
    };
    */

    vm.downloadFile = function (hash) {
      RepoService.downloadFile(hash).then(null, null);
    };

    window.downloadStateChanged = function(data) {
      var hash = data.url.split('/').pop();

      $scope.$apply(function () { // dangerous, don't abuse!
        if (!vm.downloadState[hash]) { vm.downloadState[hash] = {}; }
        vm.downloadState[hash].percent = data.percentComplete + '%';
      });

      if (data.isComplete) { // don't use percentage here, it's just a round-up (multiple 100s!)
        $scope.$apply(function () {
          vm.downloadState[hash].done = true;
        });
      }
    };
  }]);

}());
