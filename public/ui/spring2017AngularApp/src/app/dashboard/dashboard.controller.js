/**
 * Created by trai on 4/1/17.
 */

(function () {
  'use strict';

  angular.module('spring2017AngularApp')
    .controller('DashboardController', DashboardController);

  function DashboardController(highStockService, DataService, Restangular) {
    var vm = this;
    vm.stockChartOption = highStockService.getStockChart();
    var changeStockChartOption = highStockService.changeChartOption(vm.stockChartOption);
    vm.stockChartOption = changeStockChartOption.setXAxisTitle('Time');
    vm.stockChartOption = changeStockChartOption.setChartTitle('Cumulative Hours Study');

    vm.getCumulativeData = function () {
      Restangular.oneUrl('cumulative', 'http://www.jgdodson.com/json/sessions/jgdodson').get().then(function (resp) {
        console.log('resp session');
        console.log(resp.sessions);
        console.log(resp);
        vm.data = DataService.highChartCumulative(resp.sessions, 100);
        // vm.data.forEach(function (value, index) {
        //   value.x = new Data(value.x);
        // });
        vm.stockChartOption.series = [{
          name: 'Cumulative Hours',
          data: vm.data,
          tooltip: {
            valueDecimals: 2
          }
        }];
      }, function (err) {
        console.log('Error:');
        console.log(err);
      });
    };
    vm.getCumulativeData();


  }
})();
