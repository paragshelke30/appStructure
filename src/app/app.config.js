(function () {
  'use strict';

  angular
    .module('app')
    .config(configure);

  configure.$inject = ['$ionicConfigProvider'];

  function configure($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
  }
})();
