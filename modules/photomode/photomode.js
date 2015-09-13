angular.module('beamng.stuff')

.controller('PhotoModeController', ['$log', '$scope', 'bngApi', 'steamStatus', function($log, $scope, bngApi, steamStatus)  {

  // $scope.selectedMenu = '#/photomode';
  // $scope.navClass = 'contentNavPhotoMode';
  // $scope.$parent.showDashboard = false;
  // $scope.$parent.uiVisible = 1;
  // $scope.fov = 80;
  // $scope.roll = 0;
  // $scope.cameraspeed = 10;
  // $scope.cameraspeed_default = 25;
  // $scope.showSettings = false;

  // $scope.steamAvailable = false;

  bngApi.engineScript('EditorGuiStatusBar.setCamera("Smooth Rot Camera");');
  bngApi.engineScript("commandToServer('SetEditorCameraNewtonDamped');"); // camera change if the editor was not loaded before
  bngApi.engineScript("commandToServer('SetCameraFree');"); // camera change if the editor was not loaded before
  bngApi.engineScript("commandToServer('SetCameraBank');"); // camera change if the editor was not loaded before
  bngApi.engineScript('$mvFreeLook = true;');
  bngApi.engineScript('$mvRoll = 0;');

  bngApi.engineScript('$Camera::movementSpeed = ' + $scope.cameraspeed + ';');
  bngApi.engineScript('beamNGsetPhysicsEnabled(false);');
  bngApi.engineLua('gAutoHideDashboard = false');

  var vm = this;
  
  vm.showSettings   = true;
  vm.steamAvailable = steamStatus;
  console.log('steam status: ', vm.steamAvailable);

  vm.settings = {
    fov: 80,
    roll: 0,
    cameraSpeed: 10,
    cameraSpeedDefault: 25,
    visible: false
  };


  vm.takePic = function() {
    vm.settings.visible = false;
    setTimeout(function() {
      bngApi.engineScript('hideCursor();');
      bngApi.engineScript('doScreenShot(1);');
      setTimeout(function() {
        bngApi.engineScript('showCursor();');
        vm.showControls = true;
        $scope.$digest();
      }, 200);
    }, 200);
  };

  vm.sharePic = function() {
    vm.settings.visible = false;    
    setTimeout(function() {
      bngApi.engineScript('hideCursor();');
      bngApi.engineLua('screenshot.publish()');
      setTimeout(function() {
        bngApi.engineScript('showCursor();');
        vm.showControls = true;
        $scope.$digest();
      }, 200);
    }, 200);
  };

  vm.steamPic = function() {
    setTimeout(function() {
      bngApi.engineScript('hideCursor();');
      bngApi.engineLua('Steam.triggerScreenshot()');
      setTimeout(function() {
        bngApi.engineScript('showCursor();');
      }, 400);
    }, 200);
  };

  vm.toggleSettings = function () {
    vm.settings.visible = !vm.settings.visible;
    console.log('settings is now', vm.settings.visible);
  };

  $scope.$watch('photo.settings.fov', function(value) {
      bngApi.engineScript( 'setFov(' + newValue + ');' );
  });

  $scope.$watch('photo.settings.cameraSpeed', function(value) {
    console.log('changed speed', value);
    bngApi.engineScript( '$Camera::movementSpeed = ' + value + ';' );
  });

  $scope.$watch('photo.settings.roll', function (value) {
    bngApi.engineScript( 'rollAbs(' + (value * 100) + ');' ); // in rads
  })


  $scope.$on('$destroy', function() {
    $log.debug('exiting photomode.');
    bngApi.engineScript('EditorGuiStatusBar.setCamera("1st Person Camera");');
    bngApi.engineScript("commandToServer('SetEditorCameraPlayer');"); // camera change if the editor was not loaded before
    bngApi.engineScript("commandToServer('SetCameraPlayer');"); // camera change if the editor was not loaded before
    bngApi.engineScript("commandToServer('SetCameraNoBank');"); // camera change if the editor was not loaded before
    bngApi.engineScript('$mvFreeLook = false;');
    bngApi.engineScript('$mvRoll = 0;');
    bngApi.engineScript('$Camera::movementSpeed = ' + $scope.cameraspeed_default + ';');
    bngApi.engineScript('beamNGsetPhysicsEnabled(true);');
    bngApi.engineLua('gAutoHideDashboard = true');
  });

}]);

