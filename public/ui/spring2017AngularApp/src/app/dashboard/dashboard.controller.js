/**
 * Created by trai on 4/1/17.
 */

(function () {
  'use strict';

  angular.module('spring2017AngularApp')
    .controller('DashboardController', DashboardController);

  function DashboardController(highStockService, DataService, Restangular, highChartService) {
    var vm = this;
    vm.stockChartOption = highStockService.getStockChart();
    var changeStockChartOption = highStockService.changeChartOption(vm.stockChartOption);
    var changeStockHighChartOption = highChartService.changeChartOption(vm.stockChartOption);
    vm.stockChartOption = changeStockChartOption.setXAxisTitle('Time');
    vm.stockChartOption = changeStockChartOption.setChartTitle('Cumulative Hours Study');
    vm.stockChartOption = changeStockHighChartOption.setToolTipFormatter(function() {
      return 'Date: ' + new Date(this.x) + '<br>' + 'y: ' + this.y;
    });

    vm.subjectTotalOption =  highChartService.getBarChart();
    var changeSubjectTotalOption = highStockService.changeChartOption(vm.subjectTotalOption);
    vm.subjectTotalOption = changeSubjectTotalOption.setXAxisTitle("Subjects");
    vm.subjectTotalOption = changeSubjectTotalOption.setYAxisTitle("Hours");
    vm.subjectTotalOption = changeSubjectTotalOption.setChartTitle("Total Hours / Subject");
    // vm.subjectTotalOption = changeSubjectTotalOption.setXAxisCategories(['Math', 'Web Dev', 'Literature', 'Hacking', 'Science']);
    // vm.subjectTotalOption.xAxis.categories = ['Math', 'Web Dev', 'Literature', 'Hacking', 'Science'];

    vm.highProbOption = highStockService.getStockChart();
    var changeHighProbOption  = highChartService.changeChartOption(vm.highProbOption);
    vm.highProbOption = changeHighProbOption.setXAxisTitle('Hours');
    vm.highProbOption = changeHighProbOption.setYAxisTitle('Probability');
    vm.highProbOption = changeHighProbOption.setChartTitle('High Probability Studying');
    vm.highProbOption = changeHighProbOption.setToolTipFormatter(function() {
      return 'Hours: ' + this.x + '<br>' + 'Probability: ' + this.y + ' %';
    });

    vm.redrawCumulativeChart = false;
    vm.redrawSubjectTotalChart = false;

    vm.getCumulativeData = function () {
      Restangular.oneUrl('cumulative', 'http://www.jgdodson.com/json/sessions/jgdodson').get().then(function (resp) {
        console.log('resp session');
        console.log(resp.sessions);
        console.log(resp);
        vm.resp = resp;
        var data = DataService.highChartCumulative(resp.sessions, 100);
        // vm.data.forEach(function (value, index) {
        //   value.x = new Data(value.x);
        // });
        vm.stockChartOption.series = [{
          name: 'Cumulative Hours',
          data: data,
          tooltip: {
            valueDecimals: 2
          }
        }];
        vm.redrawCumulativeChart = true;
        vm.getSubjectTotalData();
        getHighPropData();
      }, function (err) {
        console.log('Error:');
        console.log(err);
      });
    };

    function getHighPropData() {
      var data = [];
      data = DataService.highChartProbability(vm.resp.sessions);

      console.log("vm.data: ");
      console.log(data);

      var result = [];

      data.forEach(function (value, index) {
        result.push({
          x: index,
          y: value
        })
      });


      vm.highProbOption.series = [{
        name: 'Probability Studying',
        data: result
      }];

      vm.redrawHighProbChart = true;
    }


    vm.getSubjectTotalData = function () {
      var data = [];
      data = DataService.subjectTotals(vm.resp.sessions);

      console.log("vm.data: ");
      console.log(data);

      var categories = [];
      var yValue = [];

      data.forEach(function (value, index) {
        categories.push(value[0]);
      });

      data.forEach(function (value, index) {
        yValue.push(value[1]);
      });


      console.log(yValue);
      console.log(categories);

      vm.subjectTotalOption.xAxis.categories = categories;

      vm.subjectTotalOption.series = [{
        name: 'Total Hours/Subject',
        data: yValue
      }];
      vm.redrawSubjectTotalChart = true;
    };

    vm.getCumulativeData();
  }
})();
