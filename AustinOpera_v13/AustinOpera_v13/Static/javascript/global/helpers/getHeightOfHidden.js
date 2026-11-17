"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeightOfHidden = void 0;
function getHeightOfHidden(element) {
    var el = element;
    var parentStyles = el.parentElement.getAttribute('style');
    var selfStyles = el.getAttribute('style');
    el.parentElement.setAttribute('style', 'position: relative !important; width: 100% !important;');
    el.setAttribute('style', 'opacity: 0 !important; height: auto !important; position: absolute !important;');
    var elementHeight = element.offsetHeight;
    if (selfStyles) {
        el.setAttribute('style', selfStyles);
    }
    else {
        el.removeAttribute('style');
    }
    if (parentStyles) {
        el.parentElement.setAttribute('style', parentStyles);
    }
    else {
        el.parentElement.removeAttribute('style');
    }
    return elementHeight;
}
exports.getHeightOfHidden = getHeightOfHidden;
//# sourceMappingURL=getHeightOfHidden.js.map