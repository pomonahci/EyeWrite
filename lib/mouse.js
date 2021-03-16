var firepad = firepad || { };
firepad.Mouse = (function () {
  'use strict';

  // A cursor has a `position` and a `selectionEnd`. Both are zero-based indexes
  // into the document. When nothing is selected, `selectionEnd` is equal to
  // `position`. When there is a selection, `position` is always the side of the
  // selection that would move if you pressed an arrow key.
  function Mouse (x, y) {
    this.x = x;
    this.y = y;
  }

  Mouse.fromJSON = function (obj) {
    return new  Mouse(obj.x, obj.y);
  };

  return Mouse;

}());