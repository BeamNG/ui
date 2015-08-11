angular.module('beamng.stuff')

.controller('EnvironmentController', ['$log', '$scope', 'bngApi', 'currentState', function($log, $scope, bngApi, currentState) {

  var vm = this;

  vm.state = currentState;

  console.log('The current state is', currentState);

  $scope.$watchCollection('environment.state', function (value) {
    $log.debug('state changed to', value);
    bngApi.sendEngineLua('environment.setState(' + bngApi.serializeToLua(value) + ')');
  });

  vm.gravity = {
    value: -9.8,
    presets: [
      { title: 'Zero Gravity',   value: 0.0    },
      { title: 'Earth',          value: -9.8   },
      { title: 'Moon',           value: -1.62  },
      { title: 'Mars',           value: -3.71  },
      { title: 'Sun',            value: -274   },
      { title: 'Jupiter',        value: -24.92 },
      { title: 'Neptune',        value: -11.15 },
      { title: 'Saturn',         value: -10.44 },
      { title: 'Uranus',         value: -8.87  },
      { title: 'Venus',          value: -8.87  },
      { title: 'Mercury',        value: -3.7   },
      { title: 'Pluto',          value: -0.58  },
      { title: 'Negative Earth', value: 9.8    }
    ]
  };

  $scope.$watch('environment.gravity.value', function (value) {
    $log.debug('gravity changed to', value);
    bngApi.sendSystemLua('setGravity(' + bngApi.serializeToLua(value) + ')');
  });

  vm.simSpeed = {
    value: 1.0,
    presets: [
      { title: 'RealTime', value: 1 },
      { title: '2x',       value: 2 },
      { title: '4x',       value: 4 },
      { title: '10x',      value: 10 },
      { title: '100x',     value: 100 }
    ]
  };

  $scope.$watch('environment.simSpeed.value', function (value) {
    $log.debug('simulation speed changed to', value);
    bngApi.sendActiveObjectLua('bullettime.set(' + value + ')');

    bngApi.engineLua('environment.getState()', function (data) {
      $log.log('got state from LUA:', data);
    });

  });

  vm.requestState = function () {
    bngApi.sendEngineLua('environment.requestState()');
  };

  vm.sendState = function () {
    var stateStr = bngApi.serializeToLua(vm.state);
    console.log('sending state', stateStr);
    bngApi.sendEngineLua('environment.setState(' + stateStr + ')');
  };


  // HookManager listeners
  $scope.$on('EnvironmentStateUpdate', function (event, data) {
    $log.debug('[environment.js] received EnvironmentStateUpdate:', data);
    vm.state = data;
  });

  }]);
