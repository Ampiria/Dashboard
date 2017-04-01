/**
 * Created by trai on 4/1/17.
 */


(function () {
  'use strict';

  angular.module('spring2017AngularApp')
    .controller('RegisterController', RegisterController)

  function RegisterController($uibModalInstance) {
    var vm = this;
    vm.closeModal = function () {
      $uibModalInstance.dismiss('cancel');
    }
  }
})();
