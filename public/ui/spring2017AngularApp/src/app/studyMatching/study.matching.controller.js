/**
 * Created by trai on 4/1/17.
 */
(function () {
  'use strict';

  angular.module('spring2017AngularApp')
    .controller('StudyMatchingController', StudyMatchingController);

  function StudyMatchingController(highStockService, $uibModal) {
    var vm = this;

    vm.openModal = function () {
      return $uibModal.open({
        animation: true,
        ariaLabelledBy: 'Login',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'app/studyMatching/chartModal.html',
        controller: 'modalController',
        controllerAs: 'vm',
        size: 'lg',
        resolve: {
        }
      });
    }
  }
})();
