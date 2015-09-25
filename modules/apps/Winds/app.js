angular.module('beamng.apps')
.directive('winds', function () {
  return {
    
    template: 
      '<div draggable="true" style="width:300px; padding:10px; background: rgba(0, 0, 0, 0.1)">' +
        '<object style="width:100%;" type="image/svg+xml" data="modules/apps/Winds/winds.svg?t=' + Date.now() + '"/>' +
        '<div layout="row" layout-align="center center" style="width:100%;">' + 
          '<md-slider flex min=0 max=210 ng-model="wind.mag"></md-slider>' + 
          '<span style="width:80px; text-align:right">{{ wind.mag }} m/s</span>' +
        '</div>' +
      '</div>',

    replace: true,

    controller: ['$scope', 'bngApi', function ($scope, bngApi) {
      $scope.wind = {
        xCoeff: 0,
        yCoeff: 1,
        mag: 0
      };

      $scope.$watch('wind', function (newVal, oldVal) {
        bngApi.systemLua('objectBroadcast("obj:setWind(' + newVal.xCoeff *  newVal.mag + ',' + newVal.yCoeff * newVal.mag + ',0)")');
      }, true);
    }],

    link: function (scope, element, attrs) {
      var obj = angular.element(element[0].children[0]);

      obj.on('load', function () {
        var svg    = angular.element(obj[0].contentDocument)
          , arrow  = svg[0].getElementById('yaw-arrow')
          , handle = angular.element(svg[0].getElementById('drag-handle'))
          , txt    = svg[0].getElementById('handle-text')
          , bbox   = svg[0].getElementById('circle-slider').getBBox()
          , rotateOrigin = {
            x: bbox.x + bbox.width/2,
            y: bbox.y + bbox.height/2,
            str: ' ' + (bbox.x + bbox.width/2) + ' ' + (bbox.y + bbox.height/2)
          }
          , yawDegrees = 0
          , dragging = false
          , auxPt  = svg[0].rootElement.createSVGPoint() // auxiliary svg point to get transform matrix between window and SVG element
          , groupTransform = svg[0].rootElement.getTransformToElement(svg[0].getElementById('layer1'))
          , posInGroup = function (event) { 
              // First convert window coordinates to SVG coordinates by taking the root element's transform matrix
              // This should not be cached because it will change when the app is moved and/or resized.
              svgTransform = svg[0].rootElement.getScreenCTM().inverse();
              auxPt.x = event.x; 
              auxPt.y = event.y;

              // Secondly, apply the transformation for the group's local coordinates.
              return auxPt.matrixTransform(svgTransform).matrixTransform(groupTransform); 
            }
        ;

        // The arrow points to the vehicle's direction. That's a read-only property taken directly
        // from the sensors stream.
        scope.$on('streamsUpdate', function (event, streams) {
          yawDegrees = -streams.sensors.yaw * 180 / Math.PI;
          arrow.setAttribute('transform', 'rotate(' + yawDegrees + rotateOrigin.str + ')');
        });

        // SVG elements don't support drag events - fake it!
        // just remember to clean up listeners afterwards. - angular should take care of this..
        handle.on('mousedown', function (event) {
          dragging = true;
        });

        svg.on('mousemove', function (event) {
          if (dragging) {
            var p = posInGroup(event)
              , windDirection = Math.atan2(p.y - rotateOrigin.y, p.x - rotateOrigin.x) + Math.PI / 2
              , theta = windDirection * 180 / Math.PI
            ;

            // phase difference! 0 degrees = north winds
            scope.wind.yCoeff = Math.cos(windDirection);
            scope.wind.xCoeff = Math.sin(windDirection);

            handle.attr('transform', 'rotate(' + theta + rotateOrigin.str + ')');
            txt.innerHTML = theta.toFixed(0);
            scope.$digest();
          }
        });

        svg.on('mouseup', function () {
          dragging = false;
        });

      });
    }
  };
});