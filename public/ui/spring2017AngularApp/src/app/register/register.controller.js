/**
 * Created by trai on 4/1/17.
 */


(function () {
  'use strict';http://localhost:3000/#/

  angular.module('spring2017AngularApp')
    .controller('RegisterController', RegisterController)

  function RegisterController($uibModalInstance, Restangular) {
    var vm = this;

    vm.userName = '';
    vm.userEmail = '';
    vm.userPassword = '';

    vm.closeModal = function () {
      $uibModalInstance.dismiss('cancel');
    }

    vm.registerUser = function () {
      console.log(vm.userName);
      console.log(vm.userEmail);
      console.log(vm.userPassword);

      var criteria = {
        username: vm.userName,
        password: vm.userPassword,
        email: vm.userEmail
      };

      Restangular.oneUrl('register', 'http://www.jgdodson.com/users/queryAdd').get(criteria).then(function (resp) {
        console.log('Response: ');
        console.log(resp);
      }, function (err) {
        console.log('Error');
        console.log(err);
      });
    }

  }
})();
