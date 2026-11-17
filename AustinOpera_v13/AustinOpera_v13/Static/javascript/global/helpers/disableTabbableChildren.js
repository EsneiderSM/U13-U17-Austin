"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableTabbableChildren = void 0;
function disableTabbableChildren(parent) {
    var tabbableChildren = [].slice.call(parent.querySelectorAll('a, button, input, select, textarea'));
    tabbableChildren.forEach(function (child) {
        child.tabIndex = -1;
    });
}
exports.disableTabbableChildren = disableTabbableChildren;
//# sourceMappingURL=disableTabbableChildren.js.map