
angular.module('beamng.stuff')

.filter('truncate', function() {
  return function(text, length, end) {
    if (isNaN(length)) {
      length = 10;
    }
    end = end || '...';

    if (text !== undefined && (text.length <= length || text.length - end.length <= length)) {
      return text;
    } else {
      return String(text).substring(0, length - end.length) + end;
    }
  };
})

.controller('Options2Controller', ['$scope', '$mdColorPalette', 'bngApi',
  function($scope,  $mdColorPalette, bngApi) {


  bngApi.engineLua('settings.requestState()');

  $scope.FPSLimiterTemp = 0;
  $scope.FPSLimiterEnabled = false;


  /********************* UI color **********************/
  var uiConfigStr = localStorage.getItem('angularThemeConfig');
  if (uiConfigStr !== null) {
    $scope.uiConfig = JSON.parse(uiConfigStr);
  }

  $scope.colorPaletteToRgbStr = function(name, light, dark) {
    var which = 'light';
    return 'rgb(' + $mdColorPalette[name][which].value.toString() + ')';
  };



  $scope.mdColorPalette = $mdColorPalette;
  $scope.setTheme = function(data) {
    localStorage.setItem('angularThemeConfig', JSON.stringify(data));
    window.location.hash = '/options2/1';
    window.location.reload();
  };
  $scope.$watch('uiConfig', function(newValue, oldValue) {
    if (newValue === oldValue) { return; }
    $scope.setTheme(newValue);
  }, true);

  $scope.uiConfigDefault = {
      primary: 'blue-grey',
      accent: 'orange',
      warn: 'red',
      background: 'grey',
      dark: false,
    };

  //console.log($mdColorPalette);
  /********************* UI color **********************/

  $scope.intelCard = function() {
    if ($scope.values && $scope.values.GraphicGPU) {
      return $scope.values.GraphicGPU.toLowerCase().indexOf('intel') !== -1;
    }
  };

  $scope.helpLink = function() {
    window.location.hash = '/help/4';
  };

  
  $scope.$watch('values.devMode', function(isEnabled, wasEnabled) {
    if (isEnabled !== wasEnabled) {
        bngApi.engineLua("bindings.updateDevmodeBlacklist("+(isEnabled?"true":"false")+")");
    }
  });

  $scope.testSound = function() {
    bngApi.engineScript('sfxPlayOnce(AudioTestSound);');
  }

  $scope.openPostFXManager = function() {
    bngApi.engineScript('Canvas.pushDialog(PostFXManager);');
  };

  $scope.$on('SettingsChanged', function (event, data) {
    $scope.applyingVars = true;

    // figure out overall quality slider: this is a good guess as the single values
    // are not used
    var oQuality = 0;
    if (data.values.GraphicOverallQuality) {
      oQuality = data.values.GraphicOverallQuality;
    } else if (data.values.GraphicMeshQuality == data.values.GraphicTextureQuality &&
      data.values.GraphicMeshQuality == data.values.GraphicLightingQuality &&
      data.values.GraphicMeshQuality == data.values.GraphicShaderQuality &&
      data.values.GraphicMeshQuality == data.values.GraphicPostfxQuality) {
      oQuality = Number(data.values.GraphicMeshQuality) + 1;
    }
    //console.log(oQuality);

    // create from the keysand values lists a dict to be able to look up values in the frontend
    for (var k in data.options) {
      if (data.options[k].modes) {
        data.options[k].modes.dict = {};
        for (var i = 0; i < data.options[k].modes.keys.length; i++) {
          data.options[k].modes.dict[ data.options[k].modes.keys[i] ] = data.options[k].modes.values[i];
        }
      }
    }
    //console.log($scope.options);

    // $scope.$apply(function() {
      $scope.values = data.values;
      $scope.FPSLimiterTemp = $scope.values.FPSLimiter; // fix for the fps limiter apply button
      $scope.FPSLimiterEnabled = $scope.values.FPSLimiter > 0;
      $scope.options = data.options;
      $scope.overallQuality.value = oQuality;
      $scope.$parent.fullScreenLoadingIndicator = false;
    // });
    $scope.applyingVars = false;
  });

  // helper function to enable/disable the fps limiter in a more userfirendly matter
  $scope.onFPSLimiterEnabled = function(newValue) {
    if (newValue && $scope.FPSLimiterTemp === 0) {
      $scope.FPSLimiterTemp = 60;
      $scope.values.FPSLimiter = 60;
    } else if (!newValue && $scope.FPSLimiterTemp > 0) {
      $scope.FPSLimiterTemp = 0;
      $scope.values.FPSLimiter = 0;
    }
  };

  // var hookObj = {
  //   onSettingsChanged: onSettingsChanged
  // };

  // HookManager.registerAllHooks(hookObj);


  function sendState() {
    if ($scope.applyingVars) { return; }

    //console.log('APPLY SETTINGS');
    //console.log($scope.values);

    $scope.applyingVars = true;
    setTimeout(function() {
      bngApi.engineLua('settings.setState(' + bngApi.serializeToLua($scope.values) + ')');
      $scope.applyingVars = false;
    }, 500);
  }

  // for which options should it show a loading screen
  var quickValues = ['GraphicGamma', 'AudioMasterVol', 'AudioEffectsVol', 'AudioMusicVol',
    'GraphicDynReflectionFacesPerupdate', 'GraphicDynReflectionDetail', 'GraphicDynReflectionDistance', 'GraphicDynReflectionTexsize'];

  function triggerLoadingScreen(fct) {
    $scope.$parent.fullScreenLoadingIndicator = true;
    //console.log("sending values to T3D:");
    //console.log($scope.values);
    // allow the loading indicator to show up
    setTimeout(fct, 150);

    // hide the loading screen after some time
    setTimeout(function() {
      $scope.$apply(function() {
        $scope.$parent.fullScreenLoadingIndicator = false;
      });
    }, 1000);
  }

  $scope.$watch('values', function(newValue, oldValue) {
    if ($scope.applyingVars) { return; }

    // figure out if we need a loading indicator
    var changedOpts = [];
    for (var k in newValue) {
      if (oldValue[k] == null || newValue[k] == null || newValue[k].toString() != oldValue[k].toString()) {
        changedOpts.push(k);
      }
    }
    // loading indicator figuring out end

    // nothing changed?
    if (changedOpts.length === 0) { return; }

    var applyFct = function() {
      sendState();
    };

    // quick change without the loading indicator?
    if (changedOpts.length == 1 && quickValues.indexOf(changedOpts[0]) != -1) {
      applyFct();
      return;
    }
    triggerLoadingScreen(applyFct);
  }, true);

  $scope.overallQuality = {
    modes:  {
      keys: ['0', '1', '2', '3', '4'],
      values: ['Custom', 'Lowest', 'Low', 'Normal', 'High'],
      dict: {'0': 'Custom', '1': 'Lowest', '2': 'Low', '3': 'Normal', '4': 'High'}
    },
    value: 0 // custom by default, we figure that out when we get the data
  };

  $scope.$watch('overallQuality.value', function(l, oldValue) {
    if ($scope.applyingVars) { return; }
    if (l == oldValue) { return; }

    $scope.values.GraphicOverallQuality = $scope.overallQuality.value;
    if (l !== 0) {
      // excludes custom mode
      // the effect categories
      if (l > 0 && l < 5) {
        $scope.values.GraphicMeshQuality = l - 1;
        $scope.values.GraphicTextureQuality = l - 1;
        $scope.values.GraphicLightingQuality = l - 1;
        $scope.values.GraphicShaderQuality = l - 1;
        $scope.values.GraphicPostfxQuality = l - 1;
      }

      // the single options
      if (l == 1) {
        // Lowest
        $scope.values.GraphicAnisotropic = 0;
        $scope.values.GraphicAntialias = 0;
        $scope.values.GraphicDynReflectionEnabled = false;
        $scope.values.GraphicDynReflectionFacesPerupdate = 1;
        $scope.values.GraphicDynReflectionDetail = 0;
        $scope.values.GraphicDynReflectionDistance = 10;
        $scope.values.GraphicDynReflectionTexsize = 0;
      } else if (l == 2) {
        // Low
        $scope.values.GraphicAnisotropic = 4;
        $scope.values.GraphicAntialias = 1;
        $scope.values.GraphicDynReflectionEnabled = false;
        $scope.values.GraphicDynReflectionFacesPerupdate = 3;
        $scope.values.GraphicDynReflectionDetail = 0;
        $scope.values.GraphicDynReflectionDistance = 50;
        $scope.values.GraphicDynReflectionTexsize = 0;
      } else if (l == 3) {
        // Normal
        $scope.values.GraphicAnisotropic = 8;
        $scope.values.GraphicAntialias = 3;
        $scope.values.GraphicDynReflectionEnabled = false;
        $scope.values.GraphicDynReflectionFacesPerupdate = 3;
        $scope.values.GraphicDynReflectionDetail = 1;
        $scope.values.GraphicDynReflectionDistance = 600;
        $scope.values.GraphicDynReflectionTexsize = 2;
      } else if (l == 4) {
        // High
        $scope.values.GraphicAnisotropic = 16;
        $scope.values.GraphicAntialias = 3;
        $scope.values.GraphicDynReflectionEnabled = false;
        $scope.values.GraphicDynReflectionFacesPerupdate = 6;
        $scope.values.GraphicDynReflectionDetail = 1;
        $scope.values.GraphicDynReflectionDistance = 1000;
        $scope.values.GraphicDynReflectionTexsize = 3;
      }
      triggerLoadingScreen(function() {
        sendState();
      });
    }
  }, true);

}]);
