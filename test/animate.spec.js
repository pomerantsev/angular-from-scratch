describe('$animate', function () {
  function inject (callback) {
    var injector = createInjector(['ng', function ($provide) {
      var reflowQueue = [];
      $provide.value('$$animateReflow', function (fn) {
        var index = reflowQueue.length;
        reflowQueue.push(fn);
        return function cancel() {
          reflowQueue.splice(index, 1);
        };
      });

      $provide.decorator('$animate', function ($delegate) {
        $delegate.triggerReflow = function () {
          _.forEach(reflowQueue, function (fn) {
            fn();
          });
          reflowQueue = [];
        };

        return $delegate;
      });
    }]);

    return function () {
      injector.invoke(callback);
    };
  }

  function isPromiseLike (obj) {
    return obj && _.isFunction(obj.then);
  }

  function browserTrigger (element, eventType, eventData) {
    if (element && !element.nodeName) element = element[0];

    eventData = eventData || {};

    var evnt;
    if (eventType === 'transitionend') {
      evnt = new TransitionEvent(eventType, eventData);
    }

    element.dispatchEvent(evnt);
  }

  function createMockStyleSheet () {
    var node = document.createElement('style');
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(node);

    var ss = document.styleSheets[document.styleSheets.length - 1];

    return {
      addRule : function(selector, styles) {
        ss.insertRule(selector + '{ ' + styles + '}', 0);
      },
      destroy : function() {
        head.removeChild(node);
      }
    };
  }

  var ss;

  beforeEach(function () {
    delete window.angular;
    publishExternalAPI();
    ss = createMockStyleSheet();
  });

  publishExternalAPI();

  describe('enter', function () {
    it('returns a promise', inject(function ($animate) {
      var parent = $('<div>');
      var child = $('<div>');
      expect(isPromiseLike($animate.enter(child, parent))).toBe(true);
    }));

    it('animates enter', inject(function ($animate, $rootScope) {
      var parent = $('<div>');
      var child = $('<div>');
      $(document.body).append(parent);
      expect(parent.children().length).toBe(0);

      $animate.enter(child, parent);
      expect(parent.children().length).toBe(1);
      expect(child.hasClass('ng-enter')).toBe(false);
      expect(child.hasClass('ng-enter-active')).toBe(false);

      $rootScope.$digest();
      expect(child.hasClass('ng-enter')).toBe(true);
      expect(child.hasClass('ng-enter-active')).toBe(false);

      $animate.triggerReflow();
      expect(child.hasClass('ng-enter')).toBe(true);
      expect(child.hasClass('ng-enter-active')).toBe(true);

      browserTrigger(child,'transitionend', { elapsedTime: 1 });
      expect(child.hasClass('ng-enter')).toBe(false);
      expect(child.hasClass('ng-enter-active')).toBe(false);
    }));

    it('animates leave', inject(function ($animate, $rootScope) {
      var parent = $('<div>');
      var child = $('<div>');

      $(document.body).append(parent);
      parent.append(child);
      expect(parent.children().length).toBe(1);

      $animate.leave(child);
      expect(parent.children().length).toBe(1);
      expect(child.hasClass('ng-leave')).toBe(false);
      expect(child.hasClass('ng-leave-active')).toBe(false);

      $rootScope.$digest();
      expect(parent.children().length).toBe(1);
      expect(child.hasClass('ng-leave')).toBe(true);
      expect(child.hasClass('ng-leave-active')).toBe(false);

      $animate.triggerReflow();
      expect(parent.children().length).toBe(1);
      expect(child.hasClass('ng-leave')).toBe(true);
      expect(child.hasClass('ng-leave-active')).toBe(true);

      browserTrigger(child,'transitionend', { elapsedTime: 1 });
      expect(parent.contents().length).toBe(0);
    }));
  });

  it('provides a cancel method', inject(function ($animate) {
    expect($animate.cancel).not.toBeUndefined();
  }));

  describe('browserTrigger', function () {
    it('dispatches a transitionend event (but not in PhantomJS)', function () {
      var hasBeenCalled = false;
      var element = $('<div>');
      element.on('transitionend', function () {
        hasBeenCalled = true;
      });
      browserTrigger(element, 'transitionend');
      expect(hasBeenCalled).toBe(true);
    });
  });
});
