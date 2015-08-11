function Controls(whitelistedDevname, controllersChangedCB, rawInputDebouncedCB, fps) {
    // Listens for raw controllers values, and throttles their rate to reasonable levels before calling user-provided callbacks
    //  var controls = new Controls(null, controllersChanged, rawInputDebounced, 10); //limit to 10 updates per second
    //  var controls = new Controls("wheel0", controllersChanged, rawInputDebounced, null); //only listen to steering wheel
    //  controls.refresh(); // reread hardware capabilities
    //  controls.destroy(); // stop processing input values
    var outerThis = this; // let closures access this
    if (fps == null || fps > 25) fps = 25;
    var debounceTimeMs = 1000./fps;

    this.devices = {};
    this.controllersChanged = function (devices) {
        outerThis.devices = deepcopystrip(devices);
        //add default values to all its controls
        for (var devname in outerThis.devices)
            for (var controlname in outerThis.devices[devname].controls)
                outerThis.devices[devname].controls[controlname].value = 0.0;
        controllersChangedCB(deepcopystrip(outerThis.devices)); //TODO don't share anywhere else? or skip the deepcopying?
    };
    this.debouncePending = {};
    this.debounceTimes = {};
    function debounce(devname, control, value) {
        var debounceId = devname + control;
        clearTimeout(outerThis.debouncePending[debounceId]);
        var call = function() {
            outerThis.rawInputDebounced(devname, control, value);
            outerThis.debounceTimes[debounceId] = Date.now();
        };
        if ( (Date.now() - outerThis.debounceTimes[debounceId]) > debounceTimeMs) call();
        outerThis.debouncePending[debounceId] = setTimeout(call, debounceTimeMs);
    };
    this.rawInputChanged = function (params){
        var devname = params["devName"];
        if (whitelistedDevname != null && devname != whitelistedDevname) return;
        if (typeof(outerThis.devices[devname]) == "undefined") return;
        debounce(devname, params["control"], params["value"]);
    };
    this.rawInputDebounced = function (devname, control, value){
        if (typeof(outerThis.devices[devname]) == "undefined") return;
        var control2 = outerThis.devices[devname]["controls"][control];
        if (typeof(control2) == "undefined") return;
        if (control2.control_type == "axis") {
            value = (value+1)/2; // normalize axis from -1..1 to 0..1
        }
        var oldValue = outerThis.devices[devname].controls[control].value;
        outerThis.devices[devname]["controls"][control].value = value;
        rawInputDebouncedCB(devname, control, oldValue, value);
    };
    // this.hooks = {
    //     onControllersChanged: controllersChanged,
    //     onRawInputChanged: rawInputChanged,
    // };
    // HookManager.registerAllHooks(this.hooks);
    this.refresh(); //TODO run before declared???
}
Controls.prototype.refresh = function(){
    beamng.sendGameEngine('sendJavaScriptInputHardwareInfo();');
    //beamng.sendGameEngine('enableUIControlForwarding();'); //TODO maybe somewhere else, more global?
}
Controls.prototype.destroy = function(){
    //beamng.sendGameEngine("disableUIControlForwarding();"); //TODO really fuck everyone else from here??
    // HookManager.unregisterAll(this.hooks);
}

function reloadBindings() {
  beamng.sendGameEngine('enableUIControlForwarding();');
  beamng.sendEngineLua('bindings.reloadAllBindings()');
  beamng.sendEngineLua('bindings.requestState()');
}
function updateControllers() {
  beamng.sendGameEngine('enableUIControlForwarding();');
  beamng.sendGameEngine('sendJavaScriptInputHardwareInfo();');
}
function locateBinding(bindingFiles, devName, key, value)
{
for (var file in bindingFiles)
    if (bindingFiles[file].devname == devName)
        for (var b in bindingFiles[file].contents.bindings)
            if (bindingFiles[file].contents.bindings[b][key] == value)
                return bindingFiles[file].contents.bindings[b];
}
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}
function deepcopystrip(obj) {
   return JSON.parse(angular.toJson(obj)); // will strip object functions and angularjs bookkeeping variables
}
var STATE;
(function() {
  'use strict';
  // angular
  // .module('Options', ['RecursionHelper', 'beamngApi', 'MenuServices'])
  // .config(['$routeProvider', 'dashMenuProvider', function($routeProvider, dashMenuProvider) {
  //   $routeProvider
  //     .when('/input', {
  //       templateUrl: 'modules/options/options.html',
  //       controller: 'OptionsController'
  //     });
  //   dashMenuProvider.addMenu({hash: '#/input', title: 'Controls', icon: 'gamepad', order: 66});
  // }])
  angular.module('beamng.stuff')
  .controller('OptionsController', ['$scope', '$log', '$timeout', 'bngApi', OptionsController])
  .directive('bngOption', OptionDirective)
  .directive('bngOptionControllers', ControllersDirective)
  .directive('bngOptionWizard', WizardDirective)
  .directive('bngOptionBindings', BindingsDirective)
  .directive('bngOptionInput', InputDirective)
  .filter("filterObj", function() { return function(items, query) {
    var input = query || '';
    input = input.toLowerCase();
    var result = {};
    angular.forEach(items, function(v1, k1) {
      if (k1.toLowerCase().indexOf(input) > -1) {
        result[k1] = v1;
        return;
      }
      angular.forEach(v1, function(v2, k2) {
        if (typeof v2 == 'string' && v2.toLowerCase().indexOf(input) > -1) {
          result[k1] = v1;
          return;
        }
      });
    });
    return result;
  };})
  .filter("filterDisplayMode", function() { return function(items, enabled) {
    if (enabled) return items;
    var result = {};
    angular.forEach(items, function(v, k) {
      if (v.hasOwnProperty("isBasic") && v["isBasic"] == true && v["order"] > 0) {
        result[k] = v;
      }
    });
    return result;
  };})
  .filter("filterCategory", function() { return function(items, cat) {
    var result = {};
    angular.forEach(items, function(v, k) {
      if (v["cat"] == cat) {
        result[k] = v;
      }
    });
    return result;
  };})
  .filter("objectLength", function() { return function(items, cat) {
    var result = 0;
    angular.forEach(items, function(v, k) {
      result++;
    });
    return result;
  };});


function OptionsController($scope, $log, $timeout, bngApi) {
  $scope.$on("$destroy", function() {
      beamng.sendGameEngine("disableUIControlForwarding();");
  });
  // set up the display
  // $scope.$parent.selectedMenu = '#/input';
  // $scope.navClass = 'contentNavOptions';
  // $scope.useThemeBackground = true;
  // $scope.$parent.showDashboard = true;

  // $scope.$parent.appEnginePadding += 500;

  // $scope.$on('$destroy', function() {
  //   $scope.$parent.appEnginePadding -= 500;
  // });

}

function OptionDirective(bngApi) {
  return {
    restrict: 'E',
    scope: {
    },
    controller: function($scope) {
    },
    templateUrl: 'modules/options/dir_bngOption.html'
  };
}
function BindingsDirective(bngApi) {
  return {
    restrict: 'E',
    scope: {
        ffb: '=ffb'
      },
    controller: function($scope, $element) {
      $scope.showAdvancedBindings = false;
      $scope.$watch('query', function(newValue, oldValue) {
          if(newValue == "") $scope.showAdvancedBindings = true;
      });
      $scope.actions = {};
      $scope.actionCategories = {};
      $scope.bindingFiles = {};
      $scope.bindingTemplate = {};
      function actionCategoriesChanged(data) {
        $scope.$apply(function() {
            $scope.actionCategories = data;
        });
      }
      function actionsChanged(actions){
        $scope.$apply(function() {
            $scope.actions = actions;
        });
      }
      function bindingTemplateChanged(bindingTemplate){
        $scope.bindingTemplate = bindingTemplate;
      }
      function bindingsChanged(bindingFiles){
        $scope.$apply(function() {
            $scope.bindingFiles = bindingFiles;
            for (var i in $scope.bindingFiles)
                if (typeof $scope.bindingFiles[i].contents.bindings.push == "undefined")
                    $scope.bindingFiles[i].contents.bindings = [] // LUA cannot tell arrays and vectors appart when they are empty. we convert to proper type if necessary
            $scope.updateFFB();
        });
      }
      $scope.editingbinding = null;
      $scope.editingdevname = null;
      $scope.ffbFound = false;
      $scope.updateFFB = function() {
          if (!$scope.ffb) return;
          var devName = "wheel0";
          var ffb_action = "steering";
          $scope.ffbFound = false;
          $scope.query = ffb_action;
          var b = locateBinding($scope.bindingFiles, devName, "action", ffb_action)
          if (b) {
            $scope.editbinding(devName, b);
            $scope.ffbFound = true;
            return;
          }
          $scope.editbinding(null, null);
      };
      $scope.isEditingAxis = function() {
          if (typeof ($scope.editingdevname) != "string") return false;
          if ($scope.editingdevname.startsWith("keyboard")) return false;
          if (typeof($scope.devices[$scope.editingdevname].controls[$scope.editingbinding.control]) == "undefined") return false;
          if ($scope.devices[$scope.editingdevname].controls[$scope.editingbinding.control].control_type == "axis") return true;
          return false;
      };
      $scope.createInputmap = function(devname) {
          var vidpid = $scope.devices[devname]["vidpid"].replace(" ", "").toLowerCase(); // remove blank spaces, like lua side does

          var contents = {};
          contents["name"] = $scope.devices[devname]["name"];
          contents["vidpid"] = vidpid;
          contents["bindings"] = [];

          var result = {};
          result["devname"] = devname;
          result["inputmapPath"] = "settings/inputmaps/" + vidpid + ".json";
          result["contents"] = contents;
          $scope.bindingFiles.push(result);
          return result;
      }
      $scope.newbinding = function(action) {
          var binding = deepcopystrip($scope.bindingTemplate);
          binding["action"] = action;
          $scope.editbinding(null, binding);
          $scope.chooseControl();
      };
      $scope.editingbindingchanged = function() {
          if ($scope.editingdevnameoriginal != $scope.editingdevname) return true;
          return angular.toJson($scope.editingbindingoriginal) != angular.toJson($scope.editingbinding);
      }
      $scope.savebinding = function(devnameoriginal, controloriginal, devname, binding) {
          // remove possible existing binding (to replace it)
          $scope.deletebinding(devnameoriginal, controloriginal);
          $scope.deletebinding(devname, binding.control);
          $scope.editingdevnameoriginal = devname;
          $scope.editingbindingoriginal = deepcopystrip(binding);

          // and then add the actual binding on its place
          var bindings = null;
          for (var file in $scope.bindingFiles) {
              if ($scope.bindingFiles[file].devname == devname) {
                  bindings = $scope.bindingFiles[file].contents.bindings;
                  break;
              }
          }
          if (!bindings) {
              console.log("Device "+devname+ " inputmap source not found. Creating one now");
              var source = $scope.createInputmap(devname);
              bindings = source.contents.bindings;
          }
          bindings.push(binding);
          saveBindings();
      };
      function saveBindings() {
          var bindingFiles = deepcopystrip($scope.bindingFiles); // strips angularjs stuff internal variables
          for(var file in bindingFiles) {
              // angularjs stores random stuff in each element. strip the most prominent ones
              for (var b in bindingFiles[file].contents.bindings)
              {
                  var binding = bindingFiles[file].contents.bindings[b];
                  if (!binding) continue;
                  for(var k in binding) {
                    if (JSON.stringify(binding[k]) == JSON.stringify($scope.bindingTemplate[k])) {
                        delete binding[k];
                    }
                  }
              }

              var lua_dict = bngApi.serializeToLua(bindingFiles[file].contents);
              var path = bindingFiles[file]["inputmapPath"];
              console.log("About to save bindings into: " + path);
              beamng.sendEngineLua("bindings.saveBindingsToDisk('"+path+"',"+lua_dict+")");
          }
          reloadBindings();
          $scope.updateFFB();
      }
      $scope.editbinding = function(devname, binding) {
          $scope.choosingControl = false;
          $scope.editingdevname = devname;
          $scope.editingbinding = deepcopystrip(binding);
          $scope.editingdevnameoriginal = devname;
          $scope.editingbindingoriginal = deepcopystrip(binding);
      }
      $scope.reloadBindings = function() {
          reloadBindings();
      }
      $scope.$on("refresh", function(e) {
           updateControllers();
           reloadBindings();
           $scope.editbinding(null, null);
      });
      $scope.defaultBindings = function() {
          angular.forEach($scope.bindingFiles, function(v, k) {
              beamng.sendEngineLua("removeFile('"+v["inputmapPath"]+"')");
          });
          reloadBindings();
      }
      $scope.deletebinding = function(devname, control) {
          for (var file in $scope.bindingFiles)
              if ($scope.bindingFiles[file].devname == devname)
                  for (var b in $scope.bindingFiles[file].contents.bindings)
                      if ($scope.bindingFiles[file].contents.bindings[b].control == control)
                          delete $scope.bindingFiles[file].contents.bindings[b];
          saveBindings();
      };
      $scope.devices = {};
      function controllersChanged(devices){
        $scope.$apply(function() {
            $scope.devices = deepcopystrip(devices);
        });
      }
      $scope.choosingControl = false;
      $scope.controlDetectionTimeout = null;
      $scope.debouncePending = {};
      $scope.debounceTimes = {};
      $scope.timeout = 100; //ms
      function debounce(devname, control, value) {
          var debounceId = devname + control;
          clearTimeout($scope.debouncePending[debounceId]);
          var call = function() {
              $scope.debouncePending[debounceId] = setTimeout(function() { rawInputDebounced(devname, control, value); }, $scope.timeout);
              $scope.debounceTimes[debounceId] = Date.now();
          };
          if ( (Date.now() - $scope.debounceTimes[debounceId]) > $scope.timeout) call();
          $scope.debouncePending[debounceId] = setTimeout(call, $scope.timeout);
      };
      function rawInputChanged(params){
        var devname = params["devName"];
        //if (whitelistedDevname != null && devname != whitelistedDevname) return;
        if (typeof($scope.devices[devname]) == "undefined") return;
        debounce(devname, params["control"], params["value"]);
      };
      function controlMovementDetected(devName, hardwareControl, control, value) {
        // alright, looks like our user moved a control enough. this *might* be the control he wants
        if ($scope.choosingControl && ($scope.choosingControl["control"] != control || $scope.choosingControl["devname"] != devName)) {
            // during our timeout period the user pressed more controls. he's probably trying a keyboard combination, so we restart from scratch
            clearTimeout($scope.controlDetectionTimeout);
            $scope.controlDetectionTimeout = null;
            $scope.choosingControl = {"control": "", "devname": ""};
        }
        if ($scope.controlDetectionTimeout == null) {
            if ($scope.choosingControl) {
                $scope.$apply(function() {
                    $scope.choosingControl["control"] = control;
                    $scope.choosingControl["devname"] = devName;
                });
            }
            var timeout; // milliseconds to wait for user to press more keys (if he wants to assign a keyboard combination)
            if (control.control_type == "key") timeout = 500; // a key? wait for a possible combination
            else                               timeout =   0; // not a key? this is the droid we're looking for, don't wait
            $scope.controlDetectionTimeout = setTimeout(controlDetected, timeout, devName, hardwareControl, control, value);
        }
      };
      function controlDetected(devName, hardwareControl, boundControl, value) {
        $scope.$apply(function() {
            if ($scope.choosingControl) {
                var existingBinding = locateBinding($scope.bindingFiles, $scope.choosingControl["devname"], "control", $scope.choosingControl["control"])
                if (existingBinding && existingBinding.action == $scope.editingbinding.action) {
                    // we are duplicating an existing binding. automatically start editing it, instead of allowing to add a new one
                    $scope.editbinding($scope.choosingControl["devname"], existingBinding);
                } else {
                    // this binding is new, let user deal with conflicts (if any) in UI and then add it
                    $scope.editingdevname = $scope.choosingControl["devname"];
                    $scope.editingbinding.control = $scope.choosingControl["control"];
                }
                setTimeout(function(){ $scope.$apply(function(){ $scope.choosingControl = false; }); }, 500);
            } else {
                // "last detected action" functionality
                var detectedBinding = locateBinding($scope.bindingFiles, devName, "control", boundControl);
                if (detectedBinding) {
                    $scope.detecteddevname = devName;
                    $scope.detectedbinding = detectedBinding;
                }
            }
            $scope.controlDetectionTimeout = null;
            $scope.devices[devName]["controls"][hardwareControl].value = value;
        });
      };
      function rawInputDebounced(devname, control, value){
        var strippedControl = control.split(" ").reverse()[0]; // strip modifiers
        if (typeof($scope.devices[devname]["controls"][strippedControl]) == "undefined") return;
        var control_type = $scope.devices[devname]["controls"][strippedControl].control_type;
        if (typeof(control_type) == "undefined")
        {
            console.log("Unrecognized control: "+devname+"::"+strippedControl+" ("+control+")");
            return;
        }
        if (control_type == "axis") value = (value+1)/2; // normalize axis from -1..1 to 0..1

        var percentThreshold = 25; // % of change needed to detect a control movement

        // we got our first value ever from the hardware controller
        if (typeof ($scope.devices[devname]["controls"][strippedControl].value) == "undefined") {
            //console.log("Setting first value for "+devname+"::"+strippedControl+" ("+value+")");
            if (control_type == "axis") {
                // we went from undefined to some value. take that value as reference for the next check, and get out of here
                $scope.devices[devname]["controls"][strippedControl].value = value;
                return;
            }
            // this was a button-like press. set the previously undefined value to the opposite of what we just got, so that the keypress is detected this time already
            // e.g. if it went from undefined to 0, assume it previously was at 1. and viceversa
            $scope.devices[devname]["controls"][strippedControl].value = 1-value;
        }
        if (devname.startsWith("mouse")) {
            // ignore mouse button up event (user just clicked the button to assign key)
            if (control == "button0") return; // left click up is ignored, was probably the user just clicking the 'reassign' button
            if (control == "button1") return; // right click is reserved for relative axis movements (camera, etc)
            // don't detect mouse movement, unless the user has reaaaaaally moved the mouse quite a bit. but keep it under 50% of screen, so that the user can always move the mouse enough to detect before hitting the window limit, regardless of where he started
            percentThreshold = 35; // Decreasing sensitivity for mouse events detection
        }
        var diff = Math.abs($scope.devices[devname]["controls"][strippedControl].value - value);
        if (diff > (percentThreshold/100.)) controlMovementDetected(devname, strippedControl, control, value);
      };
      $scope.chooseControl = function() {
          for (var devname in $scope.devices)
              for (var controlname in $scope.devices[devname].controls)
                  delete $scope.devices[devname].controls[controlname]["value"];
          $scope.choosingControl = {"control": "", "devname": ""};
      }
      $scope.devices = {};
      // $scope.hooks = {
      //     onControllersChanged: controllersChanged,
      //     onBindingsChanged: bindingsChanged,
      //     onBindingTemplateChanged: bindingTemplateChanged,
      //     onActionCategoriesChanged: actionCategoriesChanged,
      //     onActionsChanged: actionsChanged,
      //     onRawInputChanged: rawInputChanged,
      // };
      // $element.on('$destroy', function () {
      //     HookManager.unregisterAll($scope.hooks);
      // });
      // HookManager.registerAllHooks($scope.hooks);

      $scope.$on('ControllersChanged', function (event, data) {
        controllersChanged(data);
      });

      $scope.$on('BindingsChanged', function (event, data) {
        bindingsChanged(data);
      });

      $scope.$on('BindingsTemplateChanged', function (event, data) {
        bindingTemplateChanged(data);
      });

      $scope.$on('ActionCategoriesChanged', function (event, data) {
        actionCategoriesChanged(data);
      });

      $scope.$on('ActionsChanged', function (event, data) {
        actionsChanged(data);
      });

      $scope.$on('RawInputChanged', function (event, data) {
        rawInputChanged(data);
      });


      $scope.$emit("refresh");
    },
    templateUrl: 'modules/options/dir_bngOptionBindings.html'
  };
}
function ControllersDirective() {
  return {
    restrict: 'E',
    scope: {
      data: '=data'
    },
    controller: ['$scope', '$element', function($scope, $element) {
      $scope.devices = {};
      var controllersChanged = function(devices) {
          $scope.$apply(function() {
              $scope.devices = devices;
          });
      };
      function rawInputDebounced(devName, control, oldValue, newValue) {
          $scope.$apply(function() {
              $scope.devices[devName].controls[control].value = newValue;
          });
      }
      // var controls = new Controls(null, controllersChanged, rawInputDebounced, 25);

      

      var controls = {
        fps: 25,
        debounceTimeMs: 40,
        devices: {},


        controllersChanged: function (devices) {
          this.devices = angular.copy(devices);
          for (var devname in this.devices) {
            for (var controlname in this.devices[devname].controls) {
              this.devices[devname].controls[controlname].value = 0.0;
            }
          }
        },

        debouncePending: {},
        debounceTimes: {},
        rawInputDebounced: function (devname, control, value) {
          if (typeof(this.devices[devname]) == 'undefined') return;
          var control2 = this.devices[devname]['controls'][control];
          if (typeof (control2) == 'undefined') return;
          if (control2.control_type == 'axis') {
            value = (value + 1) / 2;
          }

          var oldValue = this.devices[devname].controls[control].value;
          this.devices[devname]['controls'][control].value = value;
        },

        debounce: function (devname, control, value) {
          var debounceId = devname + control;
          clearTimeout(this.debouncePending[debounceId]);
          var call = function () {
            this.rawInputDebounced(devname, control, value);
            this.debounceTime[debounceId] = Date.now()
          };

          if ( (Date.now() - this.debounceTimes[debounceId]) > this.debounceTimeMs ) call();
          this.debouncePending[debounceId] = setTimeout(call, debounceTimeMs);
        },

        rawInputChanged: function (whitelistedDevname, params) {
          var devname = params['devName'];
          if (whitelistedDevname != null && devname != whitelistedDevname) return;
          if (typeof(this.devices[devname]) == 'undefined') return;
          this.debounce(devname, params['control'], params['value']);
        }
      };


      // These hooks where registered from Controls object itself
      $scope.$on('ControllersChanged', function (event, data) {
        controls.controllersChanged(data);
        controllersChanged(data);
      });

      $scope.$on('RawInputChanged', function (event, data) {
        controls.rawInputChanged(null, data);
      });


      $scope.$on("refresh", function(e) {
        controls.refresh();
      });
      $element.on('$destroy', function () {
        controls.destroy();
      });
      $scope.$emit("refresh");
    }],
    templateUrl: 'modules/options/dir_bngOptionControllers.html'
  };
}
function WizardDirective() {
  return {
    restrict: 'E',
    scope: {
      data: '=data'
    },
    controller: ['$scope', '$element', function($scope, $element) {
      $scope.wizardSteps = [
        { action: "steer_left", hint: "Please, steer left", isInverted: false, isRanged: false },
        { action: "steer_right", hint: "Now steer right", isInverted: false, isRanged: false },
        { action: "accelerate", hint: "Press and release the accelerator", isInverted: false, isRanged: false },
        { action: "brake", hint: "Press and release the brake", isInverted: false, isRanged: false },
        { action: "toggle_dashboard", hint: "Choose a button to show the menu", isInverted: false, isRanged: false },
        { action: "center_camera", hint: "Choose a button to recenter the camera", isInverted: false, isRanged: false },
        { action: "reset_physics", hint: "Choose a button to restore the vehicle", isInverted: false, isRanged: false },
      ];
      $scope.finalBindings = {};
      $scope.laststep = $scope.wizardSteps.length + 2;
      $scope.currentstep = 1;
      $scope.change = function(newStep) {
        newStep = Math.max(1,Math.min($scope.laststep,newStep));
        if (newStep == $scope.laststep) {
            var bindings = {};
            for (var i in $scope.wizardSteps) {
                bindings[$scope.wizardSteps[i].action] = deepcopystrip($scope.wizardSteps[i]);
            }

            // detect combined steering axes
            if (bindings.steer_left.control == bindings.steer_right.control) {
                bindings["steering"] = bindings.steer_right;
                bindings["steering"].action = "steering";
                delete bindings["steer_left"];
                delete bindings["steer_right"];
            }

            // detect combined pedal axes
            if (bindings.accelerate.control == bindings.brake.control) {
                bindings["accelerate_brake"] = bindings.accelerate;
                bindings["accelerate_brake"].action = "accelerate_brake";
                delete bindings["accelerate"];
                delete bindings["brake"];
            }

            for (var i in bindings) {
                delete bindings[i].hint;
            }

            $scope.finalBindings = [];
            for (var k in bindings) {
                var binding = bindings[k];
                var finalBinding = deepcopystrip($scope.bindingTemplate);
                finalBinding.action     = binding.action;
                finalBinding.control    = binding.control;
                finalBinding.isInverted = binding.isInverted;
                finalBinding.isRanged   = binding.isRanged;
                $scope.finalBindings.push(finalBinding);
            }
        }
        $scope.currentstep = Math.max(1,Math.min($scope.laststep,newStep));
      };
      $scope.saveWizardBindings = function() {
        for (var k in $scope.finalBindings) {
            //TODO: replace and save stuff
        }
      };
      $scope.devices = {};
      function controllersChanged(devices){
        $scope.$apply(function() {
            $scope.devices = devices;
        });
      }
      $scope.bindingTemplate = {};
      function bindingTemplateChanged(bindingTemplate){
        $scope.bindingTemplate = bindingTemplate;
      }
      var controls = new Controls(null, controllersChanged, rawInputDebounced, 25);
      function actionsChanged(actions){
        $scope.$apply(function() {
            $scope.actions = actions;
        });
      }
      function rawInputDebounced(devName, control, oldValue, newValue){
        $scope.$apply(function() {
            $scope.devices[devName]["controls"][control].value = newValue;
        });
      };
      $scope.$on("refresh", function(e) {
        controls.refresh();
      });
      // $scope.hooks = {
      //   onBindingTemplateChanged: bindingTemplateChanged,
      //   onActionsChanged: actionsChanged,
      // };
      $element.on('$destroy', function () {
          controls.destroy();
          // HookManager.unregisterAll($scope.hooks);
      });
      // HookManager.registerAllHooks($scope.hooks);

      $scope.$on('BindingTemplateChanged', function (event, data) {
        bindingTemplateChanged(data);
      });

      $scope.$on('ActionsChanged', function (event, data) {
        actionsChanged(data);
      });


      $scope.$emit("refresh");
    }],
    templateUrl: 'modules/options/dir_bngOptionWizard.html'
  };
}

function InputDirective() {
  return {
    restrict: 'E',
    scope: {
      binding: "=binding",
      devname: '=devname',
        value: '=value',
        bindingaction: '=bindingaction',
        controltype: '=controltype',
        name: '=name',
        control: '=control',
      },
      controller: ['$scope', function($scope) {
      }],
    templateUrl: 'modules/options/dir_bngOptionInput.html'
  };
}


})();
