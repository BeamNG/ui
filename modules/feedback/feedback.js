angular.module('beamng.stuff')
.controller('FeedbackController', ['$scope', '$state', 'bngApi', function($scope, $state, bngApi) {

    $scope.clear = function() {
      var canvas = document.getElementById('paint');
      var ctx = canvas.getContext('2d');
      ctx.clearRect (0 , 0 , canvas.width, canvas.height);
    };

    $scope.submit = function() {
      document.getElementById('buttons').style.display = 'none';
      setTimeout(function() {
        // bn5RacZfbMK4ylCxtjbyixPpEiFwMDNL is the hardcoded support gallery id
        bngApi.engineLua('screenshot.publish("bn5RacZfbMK4ylCxtjbyixPpEiFwMDNL")');
      }, 250);

      setTimeout(function () {
        $state.go('menu');
      }, 350);
    };
  }])

  .directive('drawing', function() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        var canvas = element[0];
        var ctx = element[0].getContext('2d');

        // var sty = element[0].parentElement.style;

        var resizeFct = function() {
          canvas.width = window.innerWidth; // sty.width || window.innerWidth
          canvas.height = window.innerHeight;
          ctx.lineWidth = 5;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'red';
        };
        window.addEventListener('resize', resizeFct);
        document.getElementById('buttons').style.display = 'block';
        resizeFct();

        var mouse = {x: 0, y: 0};

        canvas.addEventListener('mousemove', function(e) {
          mouse.x = e.pageX - this.offsetLeft;
          mouse.y = e.pageY - this.offsetTop;
        }, false);
        canvas.addEventListener('mousedown', function() {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          canvas.addEventListener('mousemove', onPaint, false);
        }, false);
        canvas.addEventListener('mouseup', function() {
          canvas.removeEventListener('mousemove', onPaint, false);
        }, false);
        var onPaint = function() {
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        };
      }
    };
  });
