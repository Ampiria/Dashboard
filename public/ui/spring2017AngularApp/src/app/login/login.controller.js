/**
 * Created by trai on 4/1/17.
 */

(function () {
  'use strict';

  angular.module('spring2017AngularApp')
    .controller('LogInController', LogInController)

  function LogInController($uibModal, $scope, $uibModalInstance, Restangular) {
    var vm = this;
    vm.userName = '';
    vm.userPassword = '';

    vm.closeModal = function () {
      $uibModalInstance.dismiss('cancel');
    }

    vm.logIn = function () {
      console.log(vm.userName);
      console.log(vm.userPassword);
      Restangular.oneUrl('', '');
    }

  }
})();
