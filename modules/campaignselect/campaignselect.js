(function() {
  'use strict';
  
  angular
  .module('CampaignSelect', ['ngMaterial', 'beamngApi', 'MenuServices'])
  .config(['$routeProvider', 'dashMenuProvider', function($routeProvider, dashMenuProvider) {
    $routeProvider
    
      .when('/toplevelselect', {
        templateUrl: 'modules/campaignselect/toplevelselect.html',
        controller: 'TopLevelController',
        controllerAs: 'top'
      })
    
      .when('/campaignselect', {
        templateUrl: 'modules/campaignselect/campaignselect.html',
        controller: 'CampaignSelectController',
        controllerAs: 'campaigns',
        resolve: {
          campaignsList: function (Campaigns) {
            return Campaigns.getCampaigns();
          }
        }
      })
    
      .when('/campaignselect/:campaignId', {
          templateUrl: 'modules/campaignselect/scenarioselect.html',
          controller: 'ScenarioSelectController',
          controllerAs: 'scenarios',
          resolve: {
            scenariosList: function ($route, Campaigns) {
              return Campaigns.getScenarios($route.current.params.campaignId);
            }
          }
        });
    
    dashMenuProvider.addMenu({hash: '#/toplevelselect', title: 'Drive', icon: 'layers', order: 9});
  }])

  // WARNING: This is defined AGAIN in VehicleSelect module (must be moved to a common module!)
  .directive('errSrc', function () {
    return function (scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    };
  })
  

  .service('Campaigns', ['$q', 'bngApi', function ($q, bngApi) {
    var service = {
      getCampaigns: function () {
        var d = $q.defer();
        
        bngApi.engineLua('campaigns.getCampaigns()', function (response) {
          d.resolve(response);
        });
        
        return d.promise;
      },
      
      getScenarios: function (campaignId) {
        var d = $q.defer();
        
        bngApi.engineLua('campaigns.getScenariosForCampaignId("' + campaignId + '")', function (response) {
          d.resolve(response);
        });

        return d.promise;
      },
      
      launchScenario: function (campaignId, scenarioId) {
        var d = $q.defer();
        
        bngApi.engineLua('campaigns.startScenario("' + campaignId + '", "' + scenarioId + '")', function (response) {
          d.resolve();
        });
        
        return d.promise;
      }
    };

    return service;
  }])


  .controller('TopLevelController', ['$location', '$scope', function ($location, $scope) {
    /* COMPATIBILITY W/ HELL ..... not necessary after all -----------------------*/
    // set up the display
    $scope.selectedMenu = '#/toplevelselect';

    $scope.$parent.showDashboard = true;
    $scope.$parent.appEnginePadding = $scope.$parent.menuWidth;
    $scope.navClass = 'deletemeplease';
    /* -------------------------------------------------------------------------- */
    
    var vm = this;
    
    vm.gameState = $scope.$parent.gameState;
    
    vm.cards = [
      { title: 'Campaigns',   icon: 'grade',          description: 'something', href: '/campaignselect',  disabled: true  },
      { title: 'Scenarios',   icon: 'movie',          description: 'something', href: '/scenarioselect',  disabled: false },
      { title: 'Freeroam',    icon: 'landscape',      description: 'something', href: '/levelselect',     disabled: false },
      { title: 'Add Content', icon: 'my_library_add', description: 'something', href: '/repo',            disabled: true  }
    ];
    
    vm.goTo = function (href, dis) {
      if (!dis) {
        $location.path(href);
      }
    };
  }])
  
  .controller('CampaignSelectController', ['$location', '$scope', 'campaignList', function ($location, $scope, campaignsList) {
    /* COMPATIBILITY W/ HELL ..... not necessary after all -----------------------*/
    // set up the display
    $scope.selectedMenu = '#/toplevelselect';
    $scope.useThemeBackground = true;
    $scope.$parent.showDashboard = true;
    $scope.$parent.appEnginePadding = $scope.$parent.menuWidth;
    $scope.navClass = 'deletemeplease';
    /* -------------------------------------------------------------------------- */
    
    
    var vm = this;
    
    
    for (var i=0; i<campaignsList.length; i++)
      if (!campaignsList[i].previews)
        campaignsList[i].previews = [];
    
    console.log('In controller:', campaignsList);
    
    vm.list = campaignsList;
    vm.fallbackImgSrc = 'modules/apps/appDefault.png';
    
    vm.selected = null;
    vm.canTakeAction = false;
    
    vm.freeRoam = function () {
      vm.selected = null;
      vm.canTakeAction = true;
      
      var maxDoubleClickDelayMS = 300; // allow 300 ms for double clicking
      var timestamp = new Date().getTime();
      if (this.lastTileClick !== undefined && timestamp - this.lastTileClick < maxDoubleClickDelayMS) {
        // double click
        vm.toLevels();
      }
      this.lastTileClick = timestamp;
      // boring single click only
      
    };
    
    vm.toTop = function () {
      $location.path('/toplevelselect');
    };
    
    vm.viewDetails = function (campaignObj) {
      vm.selected = campaignObj;
      
      var maxDoubleClickDelayMS = 300; // allow 300 ms for double clicking
      var timestamp = new Date().getTime();
        if (this.lastTileClick !== undefined && timestamp - this.lastTileClick < maxDoubleClickDelayMS) {
          // double click
          vm.select();
        }
        this.lastTileClick = timestamp;
        // boring single click only
      
      console.log('selected', campaignObj);
    };
    
    vm.toLevels = function () {
      $location.path('/levelselect');
    };
    
    vm.select = function () {
      console.log('selecting', vm.selected.campaignId);
      $location.path('/campaignselect/' + vm.selected.campaignId);
    };
    
  }])
  
  .controller('ScenarioSelectController', ['$location', '$scope', 'Campaigns', 'scenarioList', 
    function ($location, $scope, Campaigns, scenariosList) {
    /* COMPATIBILITY W/ HELL ..... not necessary after all -----------------------*/
    // set up the display
    $scope.selectedMenu = '#/toplevelselect';
    $scope.$parent.showDashboard = true;
    $scope.$parent.appEnginePadding = $scope.$parent.menuWidth;
    $scope.navClass = 'deletemeplease';
    /* -------------------------------------------------------------------------- */
    
    var vm = this;
    console.log('in controller', scenariosList);
    
    vm.list = scenariosList;
    vm.fallbackImgSrc = 'modules/apps/appDefault.png';
    
    vm.selected = null;
    
    vm.viewDetails = function (scenarioObj) {
      vm.selected = scenarioObj;
      
      var maxDoubleClickDelayMS = 300; // allow 300 ms for double clicking
      var timestamp = new Date().getTime();
      if (this.lastTileClick !== undefined && timestamp - this.lastTileClick < maxDoubleClickDelayMS) {
        // double click
        if (!scenarioObj.locked) vm.launch();
      }
      this.lastTileClick = timestamp;
      // boring single click only

      console.log('selected', scenarioObj);
    };
    
    vm.backToCampaigns = function () {
      $location.path('/campaignselect');
    };
    
    vm.launch = function () {
      Campaigns.launchScenario(vm.selected.campaignId, vm.selected.scenarioId)
      .then(function () {
        console.log('ok!');
      });
    };
    
  }]);

}());