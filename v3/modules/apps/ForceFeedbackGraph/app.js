angular.module('beamng.apps')
.directive('forceFeedbackGraph', function () {
  return {
    restrict: 'E',
    template: '<canvas width="400" height="80"></canvas>',
    replace: true,
    link: function (scope, element, attrs) {
      console.log('the canvas:', element[0]);

      var chart = new SmoothieChart({
          minValue: -1.0, 
          maxValue: 1.0,
          millisPerPixel: 10,
          interpolation: 'linear', 
          grid: { fillStyle: 'white', strokeStyle: 'grey', verticalSections: 6, millisPerLine: 1000, sharpLines: true }
        })
        , steerGraph = new TimeSeries()
        , ffbGraph   = new TimeSeries()
        , steerLine = { strokeStyle: 'red',  lineWidth: 2 }
        , ffbLine   = { strokeStyle: 'blue', lineWidth: 2 }
        , ffbScale  = 1.0;

      chart.addTimeSeries(steerGraph, steerLine);
      chart.addTimeSeries(ffbGraph,   ffbLine);
      chart.streamTo(element[0], 40);

      scope.$on('streamsUpdate', function (event, streams) {
        steerGraph.append(new Date(), streams.electrics.steering_input);
        ffbScale = Math.max(Math.abs(streams.sensors.ffb), ffbScale);
        ffbGraph.append(new Date(), streams.sensors.ffb / ffbScale);
      });
    }
  };
})