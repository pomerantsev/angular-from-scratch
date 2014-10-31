describe('$animate', function () {
  function inject (callback) {
    var myModule = window.angular.module('myModule', []);
    var injector = createInjector(['ng']);

    injector.invoke(callback);
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
  });
});
