/* jshint globalstrict: true */
'use strict';

function $AnimateProvider () {
  this.$get = function ($rootScope, $$animateReflow) {

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
      animate: function (element, from, to, className, options) {
        options = options || {};
        options.from = from;
        options.to = to;
        return runAnimationPostDigest(function (done) {
          return performAnimation('animate', className, element, null, null, _.noop, options, done);
        });
      },

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
      options = options || {};
      if (!parentElement) {
        parentElement = afterElement ? afterElement.parent() : element.parent();
      }

      element.addClass(className);
      element.css(options.from || {});

      $$animateReflow(function () {
        element.addClass(className + '-active');
        element.css(_.extend(options.from || {}, options.to || {}));
        element.on('transitionend', function () {
          element.removeClass(className + ' ' + className + '-active');
          domOperation();
          doneCallback();
        });
      });
    }
  };

}
