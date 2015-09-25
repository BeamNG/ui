angular.module('beamng.apps')
.directive('compass', function () {
  return {
    template: 
      '<div draggable="true" style="width: 200px; height:300px;">' +
        '<object style="width:100%; height:100%; pointer-events: none" type="image/svg+xml" data="modules/apps/Compass/compass.svg?t=' + Date.now() + '"/>' +
      '</div>',
    replace: true,
    link: function (scope, element, attrs) {
      var obj = angular.element(element[0].children[0]);
      obj.on('load', function () {
        var svg    = angular.element(obj[0].contentDocument)
          , arrow  = svg[0].getElementById('compass-needle')
          , circle = svg[0].getElementById('compass-outer')
          , bbox = arrow.getBBox()
          , rotateOriginStr = ' ' + (bbox.x + bbox.width/2) + ' ' + (bbox.y + bbox.height/2)
          , yawDegrees = 0
        ;

        scope.$on('streamsUpdate', function (event, streams) {
          yawDegrees = streams.sensors.yaw * 180 / Math.PI;
          circle.setAttribute('transform', 'rotate(' + yawDegrees + rotateOriginStr + ')');
        });
      });
    }
  }
})