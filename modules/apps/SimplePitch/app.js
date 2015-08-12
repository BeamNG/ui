angular.module('beamng.apps')
.directive('simplePitch', function () {
  return {
    template: 
      '<div draggable="true" style="width: 200px; height:400px;">' +
        '<object  style="width:100%; height:100%; pointer-events: none" type="image/svg+xml" data="modules/apps/SimplePitch/simple-pitch.svg?t=' + Date.now() + '"/>' +
      '</div>',
    replace: true,
    link: function (scope, element, attrs) {
      var obj = angular.element(element[0].children[0]);

      obj.on('load', function () {
        var svg    = obj[0].contentDocument
          , circle = svg.getElementById('circle')
          , bbox   = circle.getBBox()
          , rotateOriginStr = ' ' + (bbox.x + bbox.width/2) + ' ' + (bbox.y + bbox.height/2)
          , pitchDegrees    = 0
          , pitchText = svg.getElementById('pitch-text');

        scope.$on('streamsUpdate', function (event, streams) {
          pitchDegrees = Math.asin(streams.sensors.pitch) * (180 / Math.PI);
          circle.setAttribute('transform', 'rotate(' + pitchDegrees + rotateOriginStr + ')');
          pitchText.innerHTML = pitchDegrees.toFixed(1) + ' &#176;';
        });

      });
    }
  };
});