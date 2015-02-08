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

    function runAnimationPostDigest (fn) {
      var defer = Q.defer();
      $rootScope.$$postDigest(function () {
        fn(function () {
          defer.resolve();
        });
      });
      return defer.promise;
    }

    return {
      enter: function (element, parentElement, afterElement, options) {
        delegate.enter(element, parentElement, afterElement);

        return runAnimationPostDigest(function (done) {
          return performAnimation('enter', 'ng-enter', element, parentElement, afterElement, _.noop, options, done);
        });
      },

      leave: function (element, options) {
        return runAnimationPostDigest(function (done) {
          return performAnimation('leave', 'ng-leave', element, null, null, function () {
            delegate.leave(element);
          }, options, done);
        });
      },

      move: function (element, parentElement, afterElement, options) {
        delegate.move(element, parentElement, afterElement);

        return runAnimationPostDigest(function (done) {
          return performAnimation('move', 'ng-move', element, parentElement, afterElement, _.noop, options, done);
        });
      },

      cancel: _.noop
    };

    function performAnimation (animationEvent, className, element, parentElement, afterElement, domOperation, options, doneCallback) {
      if (!parentElement) {
        parentElement = afterElement ? afterElement.parent() : element.parent();
      }

      element.addClass(className);

      $$animateReflow(function () {
        element.addClass(className + '-active');
        element.on('transitionend', function () {
          element.removeClass(className + ' ' + className + '-active');
          domOperation();
          doneCallback();
        });
      });
    }
  };
}
