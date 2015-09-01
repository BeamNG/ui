// (function() {
// 'use strict';

// angular
// .module('color', ['beamngApi'])
angular.module('beamng.stuff')

.directive('ngRightClick', ['$parse', function($parse) {
  return function(scope, element, attrs) {
    var fn = $parse(attrs.ngRightClick);
    element.bind('contextmenu', function(event) {
      scope.$apply(function() {
        event.preventDefault();
        fn(scope, {$event: event});
      });
    });
  };
}])

.directive('ngColor', ['$log', 'bngApi', function($log, bngApi) {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      initValue: '=ngModel',
      showText: '@', // to disable add show-text="false" to the directive
      showPresets: '@',
      presetsEditable: '@',
      showAlpha: '@',
      showMain: '@',
      preCol: '@', // to Use add pre-col="{{object with key value and value as rgb string}}"
      width: '@',
      showPreview: '@'
      // height: '@'
    },
    templateUrl: 'modules/colorpicker/color.html',
    link: function($scope, iElement, iAttrs, ngModelController) {
      $scope.$watch(
        function(scope) {return scope.initValue;},
        init
      );

      iAttrs.$observe('preCol', function() {
        if ($scope.preCol !== undefined && typeof $scope.preCol === 'string') {
          $scope.presets.car = JSON.parse($scope.preCol);
        } else {
          $scope.presets.car = $scope.preCol;
        }
      });

      iAttrs.$observe('width', function() {
        $scope.width = ($scope.width ? Number($scope.width) : 368);
        $scope.height = ($scope.width ? $scope.width / 1.75 : 200);
      });

      iAttrs.$observe('showText', function() {
        $scope.showText = ($scope.showText !== undefined ? JSON.parse($scope.showText) : true);
      });

      iAttrs.$observe('showPresets', function() {
        $scope.showPresets = ($scope.showPresets !== undefined ? JSON.parse($scope.showPresets) : true);
      });

      iAttrs.$observe('presetsEditable', function() {
        $scope.presetsEditable = ($scope.presetsEditable !== undefined ? JSON.parse($scope.presetsEditable) : false);
      });
      iAttrs.$observe('showAlpha', function() {
        $scope.showAlpha = ($scope.showAlpha !== undefined ? JSON.parse($scope.showAlpha) : true);
      });

      iAttrs.$observe('showMain', function() {
        $scope.showMain = ($scope.showMain !== undefined ? JSON.parse($scope.showMain) : true);
      });

      iAttrs.$observe('showPreview', function() {
        $scope.showPreview = ($scope.showPreview !== undefined ? JSON.parse($scope.showPreview) : true);
      });
      
      $scope.colorDot = {};
      $scope.hslMousedownFlag = false;

      $scope.color = (function() {
        var values = [0, 0, 0];
        var alpha = 0;

        //  $scope.$watch(
        //   function() {return values;},
        //   function() {console.log(values); } 
        // );

        /**
         * Converts an RGB color value to HSL. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes r, g, and b are contained in the set [0, 1] and
         * returns h, s, and l in the set [0, 1].
         *
         * @param   Number  r       The red color value
         * @param   Number  g       The green color value
         * @param   Number  b       The blue color value
         * @return  Array           The HSL representation
         **/
        function toHsl(rgb) {
          var r = rgb[0], g = rgb[1], b = rgb[2];
          var max = Math.max(r, g, b), min = Math.min(r, g, b);
          var h, s, l = (max + min) / 2;

          if (max == min) {
            h = s = 0; // achromatic
          } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max){
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }

          return [h, s, l];
        }

        /**
         * Converts an HSL color value to RGB. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes h, s, and l are contained in the set [0, 1] and
         * returns r, g, and b in the set [0, 255].
         *
         * @param   Number  h       The hue
         * @param   Number  s       The saturation
         * @param   Number  l       The lightness
         * @return  Array           The RGB representation
         **/
        function fromHsl(hsl) {
          var r, g, b;

          if (hsl[1] === 0) {
            r = g = b = hsl[2]; // achromatic
          } else {
            var hue2rgb = function hue2rgb(p, q, t) {
              if (t < 0) {t += 1;}
              if (t > 1) {t -= 1;}
              if (t < 1 / 6) {return p + (q - p) * 6 * t;}
              if (t < 1 / 2) {return q;}
              if (t < 2 / 3) {return p + (q - p) * (2 / 3 - t) * 6;}
              return p;
            };

            var q = hsl[2] < 0.5 ? hsl[2] * (1 + hsl[1]) : hsl[2] + hsl[1] - hsl[2] * hsl[1];
            var p = 2 * hsl[2] - q;
            r = hue2rgb(p, q, hsl[0] + 1 / 3);
            g = hue2rgb(p, q, hsl[0]);
            b = hue2rgb(p, q, hsl[0] - 1 / 3);
          }
          return [r, g, b];
        }

        var arr = {
          get rgb() {
            return fromHsl(values).map(function(elem) {return Math.round(elem * 255);});
          },
          get rgba() {
            return this.rgb.concat([alpha]);
          },
          set rgb(arr) {
            values = toHsl(arr);
            alpha = arr[3] || alpha;
          },
          get hsl() {
            return values;
          },
          get hsla() {
            return values.concat([alpha]);
          },
          set hsl(arr) {
            values = arr;
            alpha = arr[3] || alpha;
          }
        };

        var str = {
          get rgb01() {
            return fromHsl(values).slice(0, 3).join(' ');
          },
          get rgba01() {
            return this.rgb01 + ' ' + alpha;
          },
          set rgb01(str) {
            var arr = str.split(' ');
            values = toHsl(arr.slice(0, 3).map(function(elem) {return Math.round(Number(elem) * 255);}));
            alpha = arr[3] || alpha;
          },
          get rgb() {
            return fromHsl(values).slice(0, 3).map(function(elem) {return Math.round(elem * 255);}).join(' ');
          },
          get rgba() {
            return this.rgb + ' ' + alpha;
          },
          set rgb(str) {
            var arr = str.split(' ').map(Number);
            values = toHsl(arr);
            alpha = arr[3] || alpha;
          },
          get hsl() {
            return values.slice(0, 3).join(' ');
          },
          get hsla() {
            return this.hsl + ' ' + alpha;
          },
          set hsl(str) {
            var arr = str.split(' ').map(Number);
            values = arr;
            alpha = arr[3] || alpha;
          }
        };

        function hslCssStr (arr) {
          return Math.round(arr[0] * 360) + ',' + Math.round(arr[1] * 100) + '%,' + Math.round(arr[2] * 100) + '%';
        }

        return {
          arr: arr,
          str: str,
          get alpha() {
            return alpha;
          },
          set alpha(val) {
            alpha = val;
          },
          rgbToHsl: toHsl,
          hslToRgb: fromHsl,
          hslCssStr: hslCssStr
        };
      }());

        $scope.presets = {
          user: [],
          car: {}
        };

        $scope.carListEmpty = true;

      $scope.$watch(
        function(scope) {return scope.presets.car;},
        function() {$scope.carListEmpty = Object.keys(($scope.presets.car ? $scope.presets.car : $scope.presets.car = {})).length <= 0;}
      );

      $scope.userListEmpty = true;

      $scope.$watch(
        function(scope) {return scope.presets.user;},
        function() {$scope.userListEmpty = $scope.presets.user.length <= 0;}
      );

      function init() {
        if ($scope.initValue !== $scope.color.str.rgba01) {
          if ($scope.presets.car !== undefined && $scope.initValue in $scope.presets.car) {
            $scope.color.str.rgb = $scope.presets.car[$scope.initValue];
          } else if ($scope.initValue !== undefined && $scope.initValue.split(' ').length < 3) { // In case the the new value is astring that cannot be parsed
            $scope.color.arr.rgb = [0, 0, 0, 0];
          } else {
            $scope.color.str.rgb = $scope.initValue || '0 0 0 0';
          }
          $scope.setColorDot();
        }
        // console.log($scope.showMain);
        // console.log($scope);
      }

      $scope.$on('SettingsChanged', function (event, data) {
        $log.debug('[color.js] received Settings:', data);
        $scope.$apply(function() {
          $scope.values = data.values;
          var help = $scope.values.userColorPresets;
          if (help !== undefined) {
            $scope.presets.user = JSON.parse(help.replace(/'/g, '\"'));
          } else {
            $scope.presets.user = [];
          }
          // console.log(typeof $scope.presets.user, $scope.presets.user);
        });
      });

      bngApi.sendEngineLua('settings.requestState()');

      $scope.toIntVal = function(val, div) {
        div = div || true;
        var help = val.split(' ');
        return help.slice(0, 3).map(function(elem) {return Math.round(255 * Number(elem));}).join(',') + ', ' + (help[3] / (div ? 2 : 1));
      };

      $scope.applyPreset = function(pre) {
        var help = pre.split(' ').map(Number);
        $scope.color.arr.rgb = help;
        $scope.alpha = help[3];
        $scope.returnColor();
      };

      function updatePreStor() {
        $scope.values.userColorPresets = JSON.stringify($scope.presets.user);
        bngApi.sendEngineLua('settings.setState(' + bngApi.serializeToLua($scope.values) + ')');
      }

      $scope.addPreset = function() {
        $scope.presets.user.push($scope.color.str.rgba01);
        updatePreStor();
      };

      $scope.removePreset = function(pre) {
        if ($scope.presetsEditable) {
          $scope.presets.user.splice($scope.presets.user.indexOf(pre), 1);
          updatePreStor();
        }
      };

      $scope.updateBright = function(val) {
        var help = $scope.color.arr.hsl.slice(0, 2);
        help[2] = Number(val);
        $scope.color.arr.hsl = help;
        // console.log($scope.color.arr.hsl);
      };

      $scope.brightGradientColor = function() {
        var help = $scope.color.arr.hsl.slice(0, 2).concat([0.5]);
        return $scope.color.hslCssStr(help);
      };

      $scope.alphaGradientColor = function() {
        return $scope.color.hslCssStr($scope.color.arr.hsl);
      };

      $scope.returnColor = function() {
        // console.log($scope.color.str.rgba01);
        ngModelController.$setViewValue($scope.color.str.rgba01);
      };

      $scope.setColorDot = function() {
        var help = $scope.color.arr.hsl;
        $scope.colorDot = {x: Math.round(help[0] * $scope.width), y: Math.round($scope.height * (1 - help[1]))};
        $scope.brightness = help[2];
      };

      function getMouseInHslimg(ev, ref) {
        var elem = ev.target.getBoundingClientRect();
        var x = ev.x - elem.left;
        var y = ev.y - elem.top;
        return elem.width < 20 ? ref : {x: x, y: y};
      }

      $scope.hslMouseupLeave = function(ev) {
        if ($scope.hslMousedownFlag) {
          var info = getMouseInHslimg(ev, $scope.colorDot);
          $scope.updateColor(info.x, info.y);

          $scope.hslMousedownFlag = false;
        }
      };

      $scope.hslMousemove = function(ev) {
        if ($scope.hslMousedownFlag) {
          var info = getMouseInHslimg(ev, $scope.colorDot);
          $scope.updateColor(info.x, info.y);
        }
      };

      $scope.updateColor = function(x, y) {
        var l = $scope.color.arr.hsl[2];

        if ($scope.hslMousedownFlag) {
          $scope.color.arr.hsl = [
            (x < 0 ? 0 : (x > $scope.width ? 0.99 : x / $scope.width)),
            (y < 0 ? 1 : (y > $scope.height ? 0.01 : (1 - y / $scope.height))), l];
          $scope.setColorDot();
          $scope.returnColor();
        }
      };

      $scope.hslMousedown = function() {
        $scope.hslMousedownFlag = true;
      };


      init();
    }
  };
}]);

// })();
