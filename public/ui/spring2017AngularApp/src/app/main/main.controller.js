(function() {
  'use strict';

  angular
    .module('spring2017AngularApp')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, webDevTec, toastr, highChartService, Restangular, $uibModal, $scope) {
    var vm = this;

    vm.hideNavButton = true;
    vm.awesomeThings = [];

    vm.startStopButton = 'Start';
    vm.startButtonBoolean = true;

    vm.displayTime = false;

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

    vm.hour = 0;
    vm.minute = 0;
    vm.second = 0;



    // getData();
    //
    // activate();

    vm.clickStart = function () {
      vm.startButtonBoolean = !vm.startButtonBoolean;
      if (vm.startStopButton === 'Start') {
        vm.startStopButton = 'Stop';
        vm.displayTime = true;

        vm.setInterval = setInterval(function () {
          $scope.$apply(function () {
            vm.second ++;

            if (vm.second > 59) {
              vm.second = 0;
              vm.minute ++;
            }

            if (vm.minute > 59) {
              vm.minute = 0;
              vm.hour ++;
            }

            // vm.time = " " + vm.hour + "h : " + vm.minute + "m : " + vm.second + "s";
          });
        }, 1000);
      } else {
        vm.hour = 0;
        vm.minute = 0;
        vm.second = 0;
        clearInterval(vm.setInterval);
        vm.displayTime = false;
        vm.startStopButton = 'Start';
      }
      console.log('Clicked');
    };

    vm.logInModal = function () {
      $uibModal.open({
        animation: true,
        ariaLabelledBy: 'Login',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'app/login/login-modal.html',
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
        templateUrl: 'app/register/register-modal.html',
        controller: 'RegisterController',
        controllerAs: 'vm',
        size: 'lg',
        resolve: {
        }
      });
    };

    function getData() {
      Restangular.oneUrl('data', 'http://www.jgdodson.com/json/sessions/bobby').get().then(function (resp) {
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
      console.log(vm.hideNavButton);
      $('#wrapper').toggleClass('toggled');
      if (vm.hideNavButton) {
        vm.hideNavButton = !vm.hideNavButton;
      } else {
        vm.hideNavButton = !vm.hideNavButton;
      }
    };
  }
})();
