/**
 * Created by trai on 4/1/17.
 */
(function () {
  'use strict';

  angular.module('spring2017AngularApp')
    .controller('modalController', modalController);

  function modalController(highStockService) {
    var vm = this;
    vm.redraw = true;
    vm.option = {

        chart: {
          type: 'solidgauge',
          marginTop: 50
        },

        title: {
          text: 'Activity',
          style: {
            fontSize: '24px'
          }
        },

        tooltip: {
          borderWidth: 0,
          backgroundColor: 'none',
          shadow: false,
          style: {
            fontSize: '16px'
          },
          pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}%</span>',
          positioner: function (labelWidth) {
            return {
              x: 200 - labelWidth / 2,
              y: 180
            };
          }
        },

        pane: {
          startAngle: 0,
          endAngle: 360,
          background: [{ // Track for Move
            outerRadius: '112%',
            innerRadius: '88%',
            backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[0])
              .setOpacity(0.3)
              .get(),
            borderWidth: 0
          }, { // Track for Exercise
            outerRadius: '87%',
            innerRadius: '63%',
            backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[1])
              .setOpacity(0.3)
              .get(),
            borderWidth: 0
          }, { // Track for Stand
            outerRadius: '62%',
            innerRadius: '38%',
            backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[2])
              .setOpacity(0.3)
              .get(),
            borderWidth: 0
          }]
        },

        yAxis: {
          min: 0,
          max: 100,
          lineWidth: 0,
          tickPositions: []
        },

        plotOptions: {
          solidgauge: {
            dataLabels: {
              enabled: false
            },
            linecap: 'round',
            stickyTracking: false,
            rounded: true
          }
        },

        series: [{
          name: 'Programming',
          data: [{
            color: Highcharts.getOptions().colors[0],
            radius: '112%',
            innerRadius: '88%',
            y: 80
          }]
        }, {
          name: 'Exercise',
          data: [{
            color: Highcharts.getOptions().colors[1],
            radius: '87%',
            innerRadius: '63%',
            y: 65
          }]
        }, {
          name: 'Reading',
          data: [{
            color: Highcharts.getOptions().colors[2],
            radius: '62%',
            innerRadius: '38%',
            y: 50
          }]
        }]
    };

  }
})();



