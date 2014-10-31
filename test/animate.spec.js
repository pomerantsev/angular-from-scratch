describe('$animate', function () {
  beforeEach(function () {
    delete window.angular;
    publishExternalAPI();
  });

  describe('enter', function () {
    it('inserts an element into the parent element', function () {
      var myModule = window.angular.module('myModule', []);
      var injector = createInjector(['ng']);

      var parent = $('<div>');
      var child = $('<div>');

      injector.invoke(function ($animate) {
        expect(parent.children().length).toBe(0);
        $animate.enter(child, parent);
        expect(parent.children().length).toBe(1);
      });
    });
  });
});
