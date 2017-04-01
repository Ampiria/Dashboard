/**
 * Created by trai on 4/1/17.
 */

(function () {
  'use strict';

  angular.module('spring2017AngularApp')
    .controller('LogInController', LogInController)

  function LogInController($uibModal, $scope, $uibModalInstance) {
    var vm = this;
    vm.closeModal = function () {
      $uibModalInstance.dismiss('cancel');
    }
  }
})();