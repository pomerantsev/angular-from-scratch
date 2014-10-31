/* jshint globalstrict: true */
'use strict';

function $AnimateProvider () {
  this.$get = function () {
    return {
      enter: function (element, parent, after) {
        if (after) {
          after.after(element);
        } else {
          parent.prepend(element);
        }
      }
    };
  };
}
