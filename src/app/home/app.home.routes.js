(function () {
  'use strict';

  angular
    .module('app.home')
    .config(routes);

  routes.$inject = ['$stateProvider'];

  function routes($stateProvider) {
    $stateProvider
      .state('menu.home', {
        url: '/home',
        views: {
          menuContent: {
            templateUrl: 'app/home/home.html',
            controller: 'HomeController as vm'
          }
        }
      });
  }
})();
