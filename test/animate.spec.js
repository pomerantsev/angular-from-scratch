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

    injector.invoke(callback);
  }

  function isPromiseLike (obj) {
    return obj && _.isFunction(obj.then);
  }

  function browserTrigger (element, eventType) {
    if (element && !element.nodeName) element = element[0];

    var evnt;
    if (eventType === 'transitionend') {
      evnt = new TransitionEvent(eventType);
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

  describe('enter', function () {
    it('returns a promise', function () {
      inject(function ($animate) {
        var parent = $('<div>');
        var child = $('<div>');
        expect(isPromiseLike($animate.enter(child, parent))).toBe(true);
      });
    });

    it('animates enter', function () {
      inject(function ($animate) {
        var parent = $('<div>');
        var child = $('<div>');
        $(document.body).append(parent);
        expect(parent.children().length).toBe(0);
        $animate.enter(child, parent);
        expect(parent.children().length).toBe(0);
        $animate.triggerReflow();
        expect(child.hasClass('ng-enter')).toBe(true);
        expect(child.hasClass('ng-enter-active')).toBe(true);
        browserTrigger(parent, 'transitionend');
        expect(parent.children().length).toBe(1);
      });
    });
  });

  it('provides a cancel method', function () {
    inject(function ($animate) {
      expect($animate.cancel).not.toBeUndefined();
    });
  });

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
