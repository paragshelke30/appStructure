(function () {
  angular
    .module('app.init')
    .controller('InitController', InitController);

  InitController.$inject = [
    '$log'
  ];

  function InitController($log) {
    var vm = this;
  }
})();
