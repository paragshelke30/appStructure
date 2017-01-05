(function () {
  'use strict';

  angular
    .module('app.core', [
      /* Angular modules */
      'ngResource',
      'ngMessages',

      /* 3rd party modules */
      'ngLodash',
      'angular-uuid',
      'ionic-cache-src',
      'monospaced.elastic',
      'angular.filter'
    ]);
})();
