(function() {
  'use strict';

  angular
    .module('spring2017AngularApp')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, webDevTec, toastr, highChartService, Restangular, $uibModal, $scope) {
    var vm = this;

    vm.awesomeThings = [];
    vm.classAnimation = 'pulse';
    vm.creationDate = 1491050677551;
    vm.showToastr = showToastr;
    vm.clickAddChartOption = highChartService.getClickAddChart();
    console.log();
    var changeClickAddOption = highChartService.changeChartOption(vm.clickAddChartOption);
    console.log(changeClickAddOption);
    vm.clickAddChartOption = changeClickAddOption.setXAxisTitle('Time');
    vm.clickAddChartOption = changeClickAddOption.setYAxisTitle('Productivity');
    vm.clickAddChartOption = changeClickAddOption.setChartTitle('Performance');

    // getData();
    //
    // activate();

    vm.logInModal = function () {
      $uibModal.open({
        animation: true,
        ariaLabelledBy: 'Login',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'app/main/login/login-modal.html',
        controller: 'LogInController',
        controllerAs: 'vm',
        size: 'lg',
        scope: $scope,
        resolve: {
        }
      });
    };

    vm.registerModal = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'Login',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'app/main/register/register-modal.html',
        controller: 'RegisterController',
        controllerAs: 'vm',
        size: 'lg',
        resolve: {
        }
      });
    };

    function getData() {
      Restangular.oneUrl('data', 'http://www.jgdodson.com/json/sessions/jgdodson').getList().then(function (resp) {
        console.log("Data: ");
        console.log(resp);
      }, function () {
        console.log("Error: ");
      });
    }

    function activate() {
      getWebDevTec();
      $timeout(function() {
        vm.classAnimation = 'pulse';
      }, 4000);
    }

    function showToastr() {
      toastr.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>');
      vm.classAnimation = '';
    }

    function getWebDevTec() {
      vm.awesomeThings = webDevTec.getTec();

      angular.forEach(vm.awesomeThings, function(awesomeThing) {
        awesomeThing.rank = Math.random();
      });
    }

    vm.toggleSideBar = function () {
      $('#wrapper').toggleClass('toggled');
    };
  }
})();
