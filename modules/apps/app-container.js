angular.module('beamng.apps', [])

.directive('draggable', ['$document', function ($document) {
  return {
    link: function (scope, element, attrs) {
      var startX = 0, startY = 0, x = 0, y = 0;

      element.css({position: 'relative', cursor: 'pointer'});

      element.on('mousedown', function (event) {
        var active = scope.$eval(attrs.draggable);
        if (active) {
          event.preventDefault();
          startX = event.pageX - x;
          startY = event.pageY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        }
      });

      function mousemove (event) {
        x = event.pageX - startX;
        y = event.pageY - startY;
        element.css({ top: y + 'px', left: x + 'px' });
      }

      function mouseup () {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      }
    }
  };
}])

.directive('appContainer', ['bngApi', function (bngApi) {
  return {
    restrict: 'E',
    template: '<div ng-transclude style="position:absolute; top: 0; right: 0; left: 0; bottom: 0;"></div>',
    transclude: true,
    replace: true,
    controller: ['$compile', '$element', '$log', '$scope', '$window', function ($compile, $element, $log, $scope, $window) {
	
      // Just testing ....
      var state = {changes: ['streams'], streams: {sensors: 1}};
      bngApi.activeObjectLua('guiUpdate(' + bngApi.serializeToLua(state) + ')');
      // ............................

      $window.oUpdate = function (streams) {
        $scope.$broadcast('streamsUpdate', streams)
      };

      $scope.$on('spawnApp', function (event, data) {
        $log.info('[appContainer] receiveed spawnApp w/', data);
        if (!data.directive) return;

        var el = $compile('<' + data.directive + '></' + data.directive + '>')($scope);
        $element.append(el);
      });

    }],

    link: function (scope, element) {
      console.log('app-container is here.');
      element.on('click', function (event) {
        console.log('app-container clicked', event);
      });
    }
  };
}]);