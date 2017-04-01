/**
 * Created by trai on 4/1/17.
 */
(function () {
  'use strict';

  angular.module('spring2017AngularApp')
    .directive('highChart', function () {
      return {
        restrict: 'AEC',
        scope: {
          options: '='
        },
        template: '<div id="interactiveChart" style="width: 100%"></div>',
        link: function (scope, element, attrs) {
          console.log('Chart Directive');
          console.log(scope.option);
          Highcharts.chart(element[0], scope.options);
        }
      };
    });


})();

