"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlockBody = exports.lockBody = void 0;
function lockBody() {
    var bodyStyles = document.body.style.cssText;
    document.body.style.overflow = 'hidden';
    return bodyStyles;
}
exports.lockBody = lockBody;
function unlockBody(oldStyles) {
    document.body.style.cssText = oldStyles || '';
}
exports.unlockBody = unlockBody;
//# sourceMappingURL=lockBody.js.map