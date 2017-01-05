(function () {
  'use strict';

  angular
    .module('app.init')
    .config(routes);

  routes.$inject = ['$stateProvider'];

  function routes($stateProvider) {
    $stateProvider.state('init', {
      url: '/init',
      templateUrl: 'app/init/init.html',
      controller: 'InitController as vm'
    });
  }
})();
