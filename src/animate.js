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

    var delegate = {
      enter: function (element, parentElement, afterElement) {
        if (afterElement) {
          afterElement.after(element);
        } else {
          parentElement.prepend(element);
        }
      },

      leave: function (element) {
        element.remove();
      },

      move: function (element, parentElement, afterElement) {
        return this.enter(element, parentElement, afterElement);
      }
    };

    return {
      enter: function (element, parentElement, afterElement) {
        delegate.enter(element, parentElement, afterElement);

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
              delegate.leave(element);
            });
          });
        });
        return asyncPromise();
      },

      move: function (element, parentElement, afterElement) {
        delegate.move(element, parentElement, afterElement);

        $rootScope.$$postDigest(function () {
          element.addClass('ng-move');
          $$animateReflow(function () {
            element.addClass('ng-move-active');
            element.on('transitionend', function () {
              element.removeClass('ng-move ng-move-active');
            });
          });
        });
      },

      cancel: _.noop
    };
  };
}
