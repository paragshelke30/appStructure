(function () {
  'use strict';

  angular
    .module('app.menu')
    .directive('toggleClass', toggleClass);

  toggleClass.$inject = ['$compile', '$parse'];

  function toggleClass() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.bind('click', function () {
          var ionList = document.getElementsByClassName(attrs.toggleClass);

          for (var i = 0; i < ionList.length; i++) {
            var str = ionList[i].className;

            if (typeof (str) === 'string') {
              ionList[i].className = str.replace(attrs.toggleClass, '');
            }
          }

          element.addClass(attrs.toggleClass);
        });
      }
    };
  }
})();
