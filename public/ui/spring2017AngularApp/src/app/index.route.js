(function() {
  'use strict';

  angular
    .module('spring2017AngularApp')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .state('home.dashboard', {
        url: 'dashboard',
        templateUrl: 'app/dashboard/dashboard.html',
        controller: 'DashboardController',
        controllerAs: 'vm'
      })
      .state('home.studyMatching', {
        url: 'StudyMatching',
        templateUrl: 'app/studyMatching/study-matching.html',
        controller: 'StudyMatchingController',
        controllerAs: 'vm'
      })
      .state('home.MyGoals', {
        url: 'MyGoals',
        templateUrl: 'app/myGoal/my-goal.html',
        controller: 'MyGoalController',
        controllerAs: 'vm'
      })

    ;

    $urlRouterProvider.otherwise('/dashboard');
  }

})();
