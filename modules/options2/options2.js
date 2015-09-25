
angular.module('beamng.stuff')

.value('Settings', {
  values: {},
  options: {}
})

.constant('QualityPresets', 
  [ 
    { val: 0, txt: 'Custom'},
    { val: 1, txt: 'Lowest'},
    { val: 2, txt: 'Low'   },
    { val: 3, txt: 'Normal'},
    { val: 4, txt: 'High'  }
  ])

.controller('Options2Controller', ['$log', '$scope', '$mdColorPalette', 'bngApi', 'Settings', 'QualityPresets', 'settings_init',
function($log, $scope, $mdColorPalette, bngApi, Settings, QualityPresets, settings_init) {
  
  settings_init(); // de-register $rootScope listener added in the resolve phase

  $log.log('Current settings:', Settings);

  var vm = this;

  vm.data = Settings;
  vm.overallQuality = QualityPresets[0];

  vm.applyState = function () {
    $log.log('[SettingsController] setting state %o', Settings.values);
    bngApi.engineLua('settings.setState(' + bngApi.serializeToLua(Settings.values) + ')');
  };

  vm.resetGamma = function () {
    vm.data.values.GraphicGamma = 1.0;
    vm.applyState();
  };
  
  vm.setQualityPreset = function (index) {
    vm.overallQuality = QualityPresets[index];
    $log.log('overall quality changed to %o', vm.overallQuality);

    if (index != 0) {
      Settings.values.GraphicMeshQuality     = index - 1;
      Settings.values.GraphicTextureQuality  = index - 1;
      Settings.values.GraphicLightingQuality = index - 1;
      Settings.values.GraphicShaderQuality   = index - 1;
      Settings.values.GraphicPostfxQuality   = index - 1;
    }

    switch (index) {
    case 1: // Lowest
      Settings.values.GraphicAnisotropic = 0;
      Settings.values.GraphicAntialias   = 0;
      Settings.values.GraphicDynReflectionEnabled = false;
      Settings.values.GraphicDynReflectionFacesPerupdate = 1;
      Settings.values.GraphicDynReflectionDetail   = 0;
      Settings.values.GraphicDynReflectionDistance = 10;
      Settings.values.GraphicDynReflectionTexsize  = 0;
      break;
    case 2: // Low
      Settings.values.GraphicAnisotropic = 4;
      Settings.values.GraphicAntialias   = 1;
      Settings.values.GraphicDynReflectionEnabled = false;
      Settings.values.GraphicDynReflectionFacesPerupdate = 3;
      Settings.values.GraphicDynReflectionDetail   = 0;
      Settings.values.GraphicDynReflectionDistance = 50;
      Settings.values.GraphicDynReflectionTexsize  = 0;
      break;
    case 3: // Normal
      Settings.values.GraphicAnisotropic = 8;
      Settings.values.GraphicAntialias   = 3;
      Settings.values.GraphicDynReflectionEnabled = false;
      Settings.values.GraphicDynReflectionFacesPerupdate = 3;
      Settings.values.GraphicDynReflectionDetail   = 1;
      Settings.values.GraphicDynReflectionDistance = 600;
      Settings.values.GraphicDynReflectionTexsize  = 2;
      break;
    case 4: // High
      Settings.values.GraphicAnisotropic = 16;
      Settings.values.GraphicAntialias   = 3;
      Settings.values.GraphicDynReflectionEnabled = false;
      Settings.values.GraphicDynReflectionFacesPerupdate = 6;
      Settings.values.GraphicDynReflectionDetail   = 1;
      Settings.values.GraphicDynReflectionDistance = 1000;
      Settings.values.GraphicDynReflectionTexsize  = 3;
      break;
    default:
      $log.log('No predefined values for preset %o', vm.overallQuality);
      break;
    }

    if (index != 0) vm.applyState();
  };




  // bngApi.engineLua('settings.requestState()');

  // $scope.FPSLimiterTemp = 0;
  // $scope.FPSLimiterEnabled = false;


  /********************* UI color **********************/
  var uiConfigStr = localStorage.getItem('angularThemeConfig');
  if (uiConfigStr !== null) {
    console.log('not null???', uiConfigStr);
    $scope.uiConfig = JSON.parse(uiConfigStr);
  }

  $scope.colorPaletteToRgbStr = function(name, light, dark) {
    var which = 'A700';
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


  // 3. Sound
  vm.testSound = function() { 
    bngApi.engineScript('sfxPlayOnce(AudioTestSound);'); 
  };

  vm.openPostFXManager = function() {
    bngApi.engineScript('Canvas.pushDialog(PostFXManager);');
  };



  // $scope.$on('SettingsChanged', function (event, data) {
  //   $scope.applyingVars = true;

  //   // figure out overall quality slider: this is a good guess as the single values
  //   // are not used
  //   var oQuality = 0;
  //   if (data.values.GraphicOverallQuality) {
  //     oQuality = data.values.GraphicOverallQuality;
  //   } else if (data.values.GraphicMeshQuality == data.values.GraphicTextureQuality &&
  //     data.values.GraphicMeshQuality == data.values.GraphicLightingQuality &&
  //     data.values.GraphicMeshQuality == data.values.GraphicShaderQuality &&
  //     data.values.GraphicMeshQuality == data.values.GraphicPostfxQuality) {
  //     oQuality = Number(data.values.GraphicMeshQuality) + 1;
  //   }
  //   //console.log(oQuality);

  //   // create from the keysand values lists a dict to be able to look up values in the frontend
  //   for (var k in data.options) {
  //     if (data.options[k].modes) {
  //       data.options[k].modes.dict = {};
  //       for (var i = 0; i < data.options[k].modes.keys.length; i++) {
  //         data.options[k].modes.dict[ data.options[k].modes.keys[i] ] = data.options[k].modes.values[i];
  //       }
  //     }
  //   }
  //   //console.log($scope.options);

  //   // $scope.$apply(function() {
  //     $scope.values = data.values;
  //     console.log('$scope.values', $scope.values);
  //     $scope.FPSLimiterTemp = $scope.values.FPSLimiter; // fix for the fps limiter apply button
  //     $scope.FPSLimiterEnabled = $scope.values.FPSLimiter > 0;
  //     $scope.options = data.options;
  //     $scope.overallQuality.value = oQuality;
  //     $scope.$parent.fullScreenLoadingIndicator = false;
  //   // });
  //   $scope.applyingVars = false;
  // });

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


  // for which options should it show a loading screen
  var quickValues = ['GraphicGamma', 'AudioMasterVol', 'AudioEffectsVol', 'AudioMusicVol',
    'GraphicDynReflectionFacesPerupdate', 'GraphicDynReflectionDetail', 'GraphicDynReflectionDistance', 'GraphicDynReflectionTexsize'];


}]);
