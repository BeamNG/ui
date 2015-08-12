angular.module('beamng.apps')
.directive('simpleRoll', function () {
  return {
    template: 
      '<div draggable="true" style="width: 200px; height:400px;">' +
        '<object  style="width:100%; height:100%; pointer-events: none" type="image/svg+xml" data="modules/apps/SimpleRoll/simple-roll.svg?t=' + Date.now() + '"/>' +
      '</div>',
    replace: true,
    link: function (scope, element, attrs) {
      var obj = angular.element(element[0].children[0]);

      obj.on('load', function () {
        var svg    = obj[0].contentDocument
          , circle = svg.getElementById('circle')
          , bbox   = circle.getBBox()
          , rotateOriginStr = ' ' + (bbox.x + bbox.width/2) + ' ' + (bbox.y + bbox.height/2)
          , rollDegrees     = 0
          , rollText        = svg.getElementById('roll-text');

        scope.$on('streamsUpdate', function (event, streams) {
          rollDegrees = Math.asin(streams.sensors.roll) * (180 / Math.PI);
          circle.setAttribute('transform', 'rotate(' + rollDegrees + rotateOriginStr + ')');
          rollText.innerHTML = rollDegrees.toFixed(1) + ' &#176;';
        });

      });
    }
  };
});