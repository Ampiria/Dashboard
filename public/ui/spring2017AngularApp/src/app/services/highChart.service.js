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
      changeChartOption: changeChartOption,
      getBarChart: getBarChart
    };

    function changeChartOption(option) {
      return {
        setXAxisTitle: function (name) {
          option.xAxis.title.text = name;
          return option;
        },


        setXAxisCategories: function (categories) {
          option.xAxis.categories = categories;
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
        },

        setToolTipFormatter: function (format) {
          option.tooltip.formatter = format;
          return option;
        }
      };
    }

    function getBarChart() {
      return {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Historic World Population by Region'
        },
        subtitle: {
          text: ''
        },
        xAxis: {
          categories: ['Africa', 'America', 'Asia', 'Europe', 'Oceania'],
          title: {
            text: null
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Population (millions)',
            align: 'high'
          },
          labels: {
            overflow: 'justify'
          }
        },
        tooltip: {
          valueSuffix: ' millions'
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true
            }
          }
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          x: -40,
          y: 80,
          floating: true,
          borderWidth: 1,
          backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
          shadow: true
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'Year 1800',
          data: [107, 31, 635, 203, 2]
        }, {
          name: 'Year 1900',
          data: [133, 156, 947, 408, 6]
        }, {
          name: 'Year 2012',
          data: [1052, 954, 4250, 740, 38]
        }]
      }
    }

    function getClickAddChart() {
      return {
        chart: {
          type: 'column',
          events: {
            click: function (e) {
              // find the clicked values and the series
              var x = Math.round(e.xAxis[0].value),
                y = Math.round(e.yAxis[0].value),
                series = this.series[0];

              // Add it
              series.addPoint([x, y]);

            }
          }
        },
        title: {
          text: 'My Goal'
        },
        subtitle: {
          text: ''
        },
        credits: {
          enabled: false
        },
        xAxis: {
          // type: 'datetime',
          gridLineWidth: 1,
          min: 0,
          max: 20,
          minPadding: 0.2,
          maxPadding: 0.2,
          maxZoom: 60,
          title: {
            text: 'Days'
          }
        },
        yAxis: {
          title: {
            text: 'Hours'
          },
          min: 0,
          max: 24,
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
        tooltip: {
          formatter: function () {
            return this.x + ' Days from now ' + '<br>' + 'Study ' + this.y + ' Hours';
          }
        },
        series: [{
          name: 'Goal',
          data: [{
          }]
        }]
      }
    }
  }
})();
