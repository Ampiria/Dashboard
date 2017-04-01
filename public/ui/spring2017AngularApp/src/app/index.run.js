(function() {
  'use strict';

  angular
    .module('spring2017AngularApp')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
