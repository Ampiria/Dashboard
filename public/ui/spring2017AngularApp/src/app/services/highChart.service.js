/**
 * Created by trai on 4/1/17.
 */
(function () {
  'use strict';
  angular.module('spring2017AngularApp')
    .factory('highChartService', highChartService);

  function highChartService() {
    return {
      getClickAddChart: getClickAddChart,
      changeChartOption: changeChartOption
    };

    function changeChartOption(option) {
      return {
        setXAxisTitle: function (name) {
          option.xAxis.title.text = name;
          return option;
        },

        setYAxisTitle: function (name) {
          option.yAxis.title.text = name;
          return option;
        },

        setChartTitle: function (name) {
          option.title.text = name;
          return option;
        },

        setSeriesData: function (data) {
          option.series = data;
        },

        setLegendLocation: function (location) {
          option.legend.align = location;
          return option
        },

        setLegendOption: function (legend) {
          option.legend = legend;
          return option;
        },

        hideLegendLocation: function (status) {

          if (status) {
            option.legend.enabled = true;
          } else  {
            option.legend.enabled = false;
          }

          return option;
        }
      };
    }

    function getClickAddChart() {
      return {
        chart: {
          type: 'scatter',
          margin: [70, 50, 60, 80],
          events: {
            click: function (e) {
              // find the clicked values and the series
              var x = e.xAxis[0].value,
                y = e.yAxis[0].value,
                series = this.series[0];

              // Add it
              series.addPoint([x, y]);

            }
          }
        },
        title: {
          text: 'User supplied data'
        },
        subtitle: {
          text: ''
        },
        credits: {
          enabled: false
        },
        xAxis: {
          gridLineWidth: 1,
          minPadding: 0.2,
          maxPadding: 0.2,
          maxZoom: 60,
          title: {
            text: 'Time'
          }
        },
        yAxis: {
          title: {
            text: 'Value'
          },
          minPadding: 0.2,
          maxPadding: 0.2,
          maxZoom: 60,
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        plotOptions: {
          series: {
            lineWidth: 1,
            point: {
              events: {
                'click': function () {
                  if (this.series.data.length > 1) {
                    this.remove();
                  }
                }
              }
            }
          }
        },
        series: [{
          data: [[20, 20], [80, 80]]
        }]
      }
    }
  }
})();
