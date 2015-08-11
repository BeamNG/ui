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

  bngApi.sendGameEngine('EditorGuiStatusBar.setCamera("Smooth Rot Camera");');
  bngApi.sendGameEngine("commandToServer('SetEditorCameraNewtonDamped');"); // camera change if the editor was not loaded before
  bngApi.sendGameEngine("commandToServer('SetCameraFree');"); // camera change if the editor was not loaded before
  bngApi.sendGameEngine("commandToServer('SetCameraBank');"); // camera change if the editor was not loaded before
  bngApi.sendGameEngine('$mvFreeLook = true;');
  bngApi.sendGameEngine('$mvRoll = 0;');

  bngApi.sendGameEngine('$Camera::movementSpeed = ' + $scope.cameraspeed + ';');
  bngApi.sendGameEngine('beamNGsetPhysicsEnabled(false);');
  bngApi.sendEngineLua('gAutoHideDashboard = false');

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
      bngApi.sendGameEngine('hideCursor();');
      bngApi.sendGameEngine('doScreenShot(1);');
      setTimeout(function() {
        bngApi.sendGameEngine('showCursor();');
        vm.showControls = true;
        $scope.$digest();
      }, 200);
    }, 200);
  };

  vm.sharePic = function() {
    vm.settings.visible = false;    
    setTimeout(function() {
      bngApi.sendGameEngine('hideCursor();');
      bngApi.sendEngineLua('screenshot.publish()');
      setTimeout(function() {
        bngApi.sendGameEngine('showCursor();');
        vm.showControls = true;
        $scope.$digest();
      }, 200);
    }, 200);
  };

  vm.steamPic = function() {
    setTimeout(function() {
      bngApi.sendGameEngine('hideCursor();');
      bngApi.sendEngineLua('Steam.triggerScreenshot()');
      setTimeout(function() {
        bngApi.sendGameEngine('showCursor();');
      }, 400);
    }, 200);
  };

  vm.toggleSettings = function () {
    vm.settings.visible = !vm.settings.visible;
    console.log('settings is now', vm.settings.visible);
  };

  $scope.$watch('photo.settings.fov', function(value) {
      bngApi.sendGameEngine( 'setFov(' + newValue + ');' );
  });

  $scope.$watch('photo.settings.cameraSpeed', function(value) {
    console.log('changed speed', value);
    bngApi.sendGameEngine( '$Camera::movementSpeed = ' + value + ';' );
  });

  $scope.$watch('photo.settings.roll', function (value) {
    bngApi.sendGameEngine( 'rollAbs(' + (value * 100) + ');' ); // in rads
  })


  $scope.$on('$destroy', function() {
    $log.debug('exiting photomode.');
    bngApi.sendGameEngine('EditorGuiStatusBar.setCamera("1st Person Camera");');
    bngApi.sendGameEngine("commandToServer('SetEditorCameraPlayer');"); // camera change if the editor was not loaded before
    bngApi.sendGameEngine("commandToServer('SetCameraPlayer');"); // camera change if the editor was not loaded before
    bngApi.sendGameEngine("commandToServer('SetCameraNoBank');"); // camera change if the editor was not loaded before
    bngApi.sendGameEngine('$mvFreeLook = false;');
    bngApi.sendGameEngine('$mvRoll = 0;');
    bngApi.sendGameEngine('$Camera::movementSpeed = ' + $scope.cameraspeed_default + ';');
    bngApi.sendGameEngine('beamNGsetPhysicsEnabled(true);');
    bngApi.sendEngineLua('gAutoHideDashboard = true');
  });

}]);

