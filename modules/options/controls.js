angular.module('beamng.stuff')

/**
 * @ngdoc service
 * @name  beamng.stuff:RateLimiter
 *
 * @description Limits the rate of function calls by means of throttling or
 *              debouncing. Essentially the two functions of the service are
 *              (simplified) copies of {@link http://underscorejs.org/ underscore}
 *              library implementations.
 *
 * @note These are _not_ Angular ports of underscore's functions. This
 *       means that scope digests should be called manually (if at all).
 */
.service('RateLimiter', function () {
  return {
    
    // underscore.js debounce utility, partially rewritten as seen in
    // http://davidwalsh.name/function-debounce
    debounce: function (func, wait, immediate) {
      var timeout;
      return function () {
        var context = this, args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },

    // underscore.js debounce utility, partially rewritten as seen in
    // http://briantford.com/blog/huuuuuge-angular-apps
    throttle: function (func, wait) {
      var context, args, timeout, result;
      var previous = 0;
      var later = function () {
        previous = new Date();
        timeout = null;
        result = func.apply(context, args);
      };
      return function () {
        var now = new Date();
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
        } else if (!timeout) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      }
    }
  };
})




/**
 * @ngdoc value
 * @name  beamng.stuff:controlsContents
 *
 * @description
 * Controls-related information used by the 
 * {@link beamng.stuff:ControlsController ControlsController}.
 * These are populated once in the resolve phase of the menu.controls
 * state, each time it is activated.
**/
.value('controlsContents', {
  actions: {},
  actionCategories: {},
  bindingTemplates: {},
  bindings: {}
})

/**
 * @ngdoc controller
 * @name beamng.stuff:ControlsController
 * @requires $log
 * @requires $scope
 * @requires beamng.stuff:bngApi
 * @requires beamng.stuff:controlsContents
 *
 * @description
**/
.controller('ControlsController', ['$log', '$scope', 'bngApi', 'controlsContents', 'RateLimiter', 'controls_init',
function ($log, $scope, bngApi, controlsContents, RateLimiter, controls_init) {
  var vm = this;
  
  for (var promise in controls_init) {
    controls_init[promise]();
  }

  // Timeout used for starting input detection. Remember to cancel
  // this on the $destroy event! If the view is discarded fast enough
  // the "disableUIControlForwarding()" message will be send to the
  // game engine *before* "enableUIControlForwarding()" - we don't want this. 
  var leadInTimeout = null;

  vm.showAdvanced = false;
  vm.categories   = controlsContents.actionCategories;
  vm.actions      = controlsContents.actions;
  vm.bindings     = angular.copy(controlsContents.bindings);

  var editingTmpl = {
    state: false,
    action: '',
    binding: {},
    devName: null,
    message: 'WAIT',
    axis:   {},
    button: {},
    key: ['no', 'keypress']
  };

  vm.editing = angular.copy(editingTmpl);


  vm.editActionBinding = function (action, devname) {
    vm.editing.state = true;
    vm.editing.action = action;
    console.log('editing action:', action, 'for device', devname);
    vm.editing.devName = devname;
    
    leadInTimeout = setTimeout(function () {
      vm.editing.message = 'detecting...';
      $scope.$digest();
      bngApi.engineScript('enableUIControlForwarding();');
    }, 1500);
  };


  vm.lastInput = '';

  // This is used as a helper variable which gives its value to a
  // newly assigned control. We don't make the assignment directly
  // from the input data because of the possibly high rate, i.e. it
  // helps us ignore incoming raw input data passing through *after*
  // the desired control is found.
  var triggered = null;

  $scope.$on('RawInputChanged', function (event, data) {

    if (triggered) return;

    $scope.$evalAsync(function () {
      vm.lastInput = data.devName + ', ' + data.control;
    });

    // if (vm.editing.devName) {
      // Since we are commited to listen to a specified device,
      // we don't care if another device is triggering
      if (!vm.editing.devName || data.devName == vm.editing.devName) {

        // Register the received input. The control types are handled
        // seperately, because different criteria apply to each one of them.
        // To understand why they are formed this way, one has to look in 
        // the next step where the assignment is actually made.
        switch(data['controlType']) {
        case 'axis':
          console.log('AXIS');
          if (! vm.editing.axis[data.control])
            vm.editing.axis[data.control] = { start: data.value, end: data.value }
          else 
            vm.editing.axis[data.control].end = data.value;
          break;
        case 'button':
          console.log('BUTTON');
          if (!vm.editing.button[data.control])
            vm.editing.button[data.control] = 1;
          else
            vm.editing.button[data.control] += 1;
          break;
        case 'key':
          console.log('KEY');
          vm.editing.key.push(data.control);
          vm.editing.key = vm.editing.key.slice(-2);
          break;
        }

        // Check if an assignment can be now made. The decision depends
        // on the control type.
        var valid = false;

        // If we are working with axes (i.e. the axis property has been populated) we
        // should be a little strict because there will probably be noise (mouse movements
        // are a perfect example). The criterion is if there is *enough* motion in a given
        // direction.
        for (axis in vm.editing.axis) {
          valid = Math.abs(vm.editing.axis[axis].end - vm.editing.axis[axis].start) > 0.1;
          if (valid) {
            bngApi.engineScript('disableUIControlForwarding();');
            triggered = angular.copy(data);
            $log.info('Assigning binding:', axis, vm.editing.axis);

            $scope.$applyAsync(function () {
              console.log('triggered is', triggered);
              vm.editing.message = triggered.control;
              vm.editing.devName = triggered.devName;
            });

            return;
          } 
        }

        // Buttons are the easiest, we just have to listen to 2 events of
        // the same button (i.e. an on-off event cycle).
        for (var button in vm.editing.button) {
          valid = vm.editing.button[button] > 1;
          if (valid) {
            triggered = angular.copy(data);
            bngApi.engineScript('disableUIControlForwarding();');
            $log.info('Assigning binding:', button, vm.editing.button);

            $scope.$applyAsync(function () {
              console.log('triggered is', triggered);
              vm.editing.message = triggered.control;
              vm.editing.devName = triggered.devName;
            });

            return;
          }
        }

        // Keys are easy too but not as trivial as buttons, because there can be 
        // key combinations. We keep track of the last two key events, if they 
        // coincide (again an on-off event cycle, like the case with buttons), we
        // can assign the control.
        for (var key in vm.editing.key) {
          valid = vm.editing.key[0] == vm.editing.key[1];
          if (valid) {
            triggered = angular.copy(data);
            bngApi.engineScript('disableUIControlForwarding();');
            $log.info('Assigning binding:', key, vm.editing.key);

            $scope.$applyAsync(function () {
              console.log('triggered is', triggered);
              vm.editing.message = triggered.control;
              vm.editing.devName = triggered.devName;
            });

            return;
          }
        }
      }
    // } else {
    //   // If there is no restriction on the used device,
    //   // grab the first one that triggers (and stick to it).
    //   $scope.$evalAsync(function () { 
    //     vm.editing.devName = data.devName;
    //   });
    // }
  });

  $scope.$on('$destroy', function () {
    if (leadInTimeout) clearTimeout(leadInTimeout);
    bngApi.engineScript('disableUIControlForwarding();');
  });


}])
