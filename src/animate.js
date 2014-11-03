/* jshint globalstrict: true */
'use strict';

function $AnimateProvider () {
  this.$get = function ($rootScope, $$animateReflow) {

    function asyncPromise () {
      var defer = Q.defer();
      setTimeout(function () {
        defer.resolve();
      }, 16.66);
      return defer.promise;
    }

    return {
      enter: function (element, parent, after) {
        if (after) {
          after.after(element);
        } else {
          parent.prepend(element);
        }

        $rootScope.$$postDigest(function () {
          element.addClass('ng-enter');
          $$animateReflow(function () {
            element.addClass('ng-enter-active');
            element.on('transitionend', function () {
              element.removeClass('ng-enter ng-enter-active');
            });
          });
        });

        return asyncPromise();
      },

      leave: function (element) {
        $rootScope.$$postDigest(function () {
          element.addClass('ng-leave');
          $$animateReflow(function () {
            element.addClass('ng-leave-active');
            element.on('transitionend', function () {
              element.remove();
            });
          });
        });
        return asyncPromise();
      },

      cancel: _.noop
    };
  };
}
