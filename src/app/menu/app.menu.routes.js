(function () {
  'use strict';

  angular
    .module('app.menu')
    .config(routes);

  routes.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routes($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('menu', {
        url: '/menu',
        abstract: true,
        templateUrl: 'app/menu/menu.html',
        controller: 'MenuController as vm'
      });
  }
})();
