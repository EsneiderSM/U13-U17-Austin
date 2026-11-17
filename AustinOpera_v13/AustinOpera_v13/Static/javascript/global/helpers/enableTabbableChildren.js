"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableTabbableChildren = void 0;
function enableTabbableChildren(parent) {
    var tabbableChildren = [].slice.call(parent.querySelectorAll('a, button, input, select, textarea'));
    tabbableChildren.forEach(function (child) {
        child.tabIndex = null;
    });
}
exports.enableTabbableChildren = enableTabbableChildren;
//# sourceMappingURL=enableTabbableChildren.js.map