angular.module('beamng.apps')
.directive('winds', function () {
  return {
    template: 
      '<div draggable="true" style="width: 200px; height:400px;">' +
        '<object  style="width:100%; height:100%;" type="image/svg+xml" data="modules/apps/Winds/winds.svg?t=' + Date.now() + '"/>' +
      '</div>',
    replace: true,
    link: function (scope, element, attrs) {
      var obj = angular.element(element[0].children[0]);

      obj.on('load', function () {
        var svg    = obj[0].contentDocument
          , arrow  = svg.getElementById('yaw-arrow')
          , slider = svg.getElementById('circle-slider')
          , handle = svg.getElementById('drag-handle')
          , txt    = svg.getElementById('handle-text')
          , bbox   = slider.getBBox()
          , rotateOriginStr = ' ' + (bbox.x + bbox.width/2) + ' ' + (bbox.y + bbox.height/2)
        ;

        var yawDegrees = 0;

        scope.$on('streamsUpdate', function (event, streams) {
          yawDegrees = -streams.sensors.yaw * 180 / Math.PI;
          arrow.setAttribute('transform', 'rotate(' + yawDegrees + rotateOriginStr + ')');
          handle.setAttribute('transform', 'rotate(' + yawDegrees + rotateOriginStr + ')');
        });

        handle.addEventListener('click', function () {
          console.log('mousedown');
        });


      });
    }
  };
});