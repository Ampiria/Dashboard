/**
 * Created by trai on 4/1/17.
 */

/**
 * Created by trai on 4/1/17.
 */
(function () {
  'use strict';
  angular.module('spring2017AngularApp')
    .factory('highStockService', highStockService);

  function highStockService() {
    return {
      getStockChart: getStockChart,
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

    function getStockChart() {
      return {
        rangeSelector: {
          selected: 1
        },

        tooltip: {
          valueDecimals: 2
        },


        title: {
          text: 'AAPL Stock Price'
        },
        xAxis: {
          title: {
          }
        },
        yAxis: {
          title: {
          }
        },
        series: [{
          name: 'AAPL',
          data: [
            {
              x: 1,
              y: 10
            },
            { x: 23,
              y: 20
            },
            { x: 63,
              y: 30
            },
            { x: 187,
              y: 40
            }
          ],
          tooltip: {
            valueDecimals: 2
          }
        }]
      };
    }

  }
})();
