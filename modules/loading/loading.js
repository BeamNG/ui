angular.module('beamng.stuff')
.controller('LoadingController', ['$interval', '$log', '$scope', '$window', function ($interval, $log, $scope, $window) {
  beamng.sendEngineLua('bindings.requestState()');

  var vm = this;
  vm.progress = { value: 0, text: '' };


  // This is not an actual HookManager event. It is being mocked up in [main.js]
  // from the window.updateProgress function.
  $scope.$on('UpdateProgress', function (event, data) {
    vm.progress = data;
  });

  // Just a funky way to get shuffled background images to cycle through
  var backgrounds = Array.apply(null, Array(16))
    .map(function (_, i) { return ('0' + (i+1)).slice(-2); })
    .map(function (x, _) { return 'local://local/html/v3/modules/loading/mainmenu_loading_' + x + '.jpg'; })
    .sort(function () { return 0.5 - Math.random(); })

    , bgIndex = 0
    , bgSwitch = $interval(function () {
    vm.img = backgrounds[bgIndex++];
    $scope.$digest();
  }, 1000, 0, false);


  // Show a small box with the most common controls. The bindings will be populated
  // from the "ActionsChanged" and "BindingsChanged" HookManager events. (listeners below)
  // -------------------------------------------------------------------------------------
  vm.helpActions = {
    'toggle_dashboard': {text: '', bindings: []},
    'toggle_help':      {text: '', bindings: []},
    'reset_physics':    {text: '', bindings: []},
    'accelerate':       {text: '', bindings: []},
    'brake':            {text: '', bindings: []},
    'steer_left':       {text: '', bindings: []},
    'steer_right':      {text: '', bindings: []},
    'switch_camera':    {text: '', bindings: []}, 
    'center_camera':    {text: '', bindings: []}
  };

  $scope.$on('ActionsChanged', function (event, data) {
    $log.debug('[loading.js] received ActionsChanged:', data);

    for (var action in data)
      if (action in vm.helpActions)
        vm.helpActions[action].text = data[action].title;
  });

  $scope.$on('BindingsChanged', function (event, data) {
    $log.debug('[loading.js] received BindingsChanged:', data);

    data.forEach(function (device) {
      device.contents.bindings.forEach(function (binding) {
        if (binding.action in vm.helpActions) {
          vm.helpActions[binding.action].bindings.push(binding.control);
        }
      });
    });
  });


  // Clean up the mess we made! That is 
  // (a) cancel the background switching interval
  // (b) remove updateProgress() function from window object
  // -------------------------------------------------------
  $scope.$on('$destroy', function () {
    $interval.cancel(bgSwitch);

    // if ($window.updateProgress) {
    //   delete $window.updateProgress;
    // }
  });

}]);