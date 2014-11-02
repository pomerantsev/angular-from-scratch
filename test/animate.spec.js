describe('$animate', function () {
  function inject (callback) {
    var myModule = window.angular.module('myModule', []);
    var injector = createInjector(['ng']);

    injector.invoke(callback);
  }

  function isPromiseLike (obj) {
    return obj && _.isFunction(obj.then);
  }

  beforeEach(function () {
    delete window.angular;
    publishExternalAPI();
  });

  describe('enter', function () {
    it('inserts an element into the parent element', function () {
      inject(function ($animate) {
        var parent = $('<div>');
        var child = $('<div>');
        expect(parent.children().length).toBe(0);
        $animate.enter(child, parent);
        expect(parent.children().length).toBe(1);
      });
    });

    it('returns a promise', function () {
      inject(function ($animate) {
        var parent = $('<div>');
        var child = $('<div>');
        expect(isPromiseLike($animate.enter(child, parent))).toBe(true);
      });
    });
  });

  it('provides a cancel method', function () {
    inject(function ($animate) {
      expect($animate.cancel).not.toBeUndefined();
    });
  });
});
