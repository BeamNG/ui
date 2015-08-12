angular.module('beamng.apps')
.directive('brakeTorqueGraph', function () {
  return {
    restrict: 'E',
    template: '<canvas width="400" height="80"></canvas>',
    replace: true,
    link: function (scope, element, attrs) {
      console.log('the canvas:', element[0]);

      var chart = new SmoothieChart({
          minValue: 0.0, 
          maxValue: 1500,
          millisPerPixel: 10,
          interpolation: 'linear', 
          grid: { fillStyle: 'white', strokeStyle: 'grey', verticalSections: 6, millisPerLine: 1000, sharpLines: true }
        })
        , speedGraph = new TimeSeries()
        , brakeGraphs = {'FL': new TimeSeries(), 'FR': new TimeSeries(), 'RL': new TimeSeries(), 'RR': new TimeSeries()}

      chart.addTimeSeries(speedGraph,   {strokeStyle: '#BF00FF', lineWidth: 2});
      chart.addTimeSeries(brakeGraphs['FL'], {strokeStyle: '#FF4040', lineWidth: 2});
      chart.addTimeSeries(brakeGraphs['FR'], {strokeStyle: '#38659D', lineWidth: 2});
      chart.addTimeSeries(brakeGraphs['RL'], {strokeStyle: '#FFB700', lineWidth: 2});
      chart.addTimeSeries(brakeGraphs['RR'], {strokeStyle: '#00BF3C', lineWidth: 2});
      chart.streamTo(element[0], 40);

      scope.$on('streamsUpdate', function (event, streams) {
        var xPoint = new Date();
        speedGraph.append(xPoint, streams.electrics.airspeed * 15);
        
        // The wheel sensors can break, don't take the format of incoming data for granted!
        for (var wheel in streams.wheelInfo)
          brakeGraphs[streams.wheelInfo[wheel][0]].append(xPoint, streams.wheelInfo[wheel][8]);
      });
    }
  };
});