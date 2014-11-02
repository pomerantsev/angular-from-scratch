/* jshint globalstrict: true */
'use strict';

function $AnimateProvider () {
  this.$get = function ($$animateReflow) {

    function asyncPromise () {
      var defer = Q.defer();
      setTimeout(function () {
        defer.resolve();
      }, 16.66);
      return defer.promise;
    }

    return {
      enter: function (element, parent, after) {
        $$animateReflow(function () {
          element.addClass('ng-enter').addClass('ng-enter-active');
          if (after) {
            after.after(element);
          } else {
            parent.prepend(element);
          }
        });
        return asyncPromise();
      },

      cancel: _.noop
    };
  };
}
