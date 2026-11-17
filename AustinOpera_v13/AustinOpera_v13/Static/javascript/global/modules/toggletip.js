"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toggletip = void 0;
var toggletipSelector = '[data-toggletip]';
var Toggletip = /** @class */ (function () {
    function Toggletip(panel) {
        var _this = this;
        var id = panel.id;
        this.panel = panel;
        this.trigger = document.querySelector("[aria-describedby=\"" + id + "\"]");
        this.closeButton = document.querySelector("[aria-controls=\"" + id + "\"]");
        this.closeButton.addEventListener('click', this.hide.bind(this));
        this.trigger.addEventListener('click', function () {
            if (_this.trigger.getAttribute('aria-expanded') == 'true')
                _this.hide();
            else
                _this.show();
        });
        this.hide();
    }
    Toggletip.prototype.hide = function () {
        this.panel.setAttribute('aria-hidden', 'true');
        this.trigger.setAttribute('aria-expanded', 'false');
    };
    Toggletip.prototype.show = function () {
        var openToggletip = document.querySelector(toggletipSelector + "[aria-hidden=\"false\"]");
        if (openToggletip) {
            var id = openToggletip.id;
            var trigger = document.querySelector("[aria-describedby=\"" + id + "\"]");
            openToggletip.setAttribute('aria-hidden', 'true');
            trigger.setAttribute('aria-expanded', 'false');
        }
        this.panel.setAttribute('aria-hidden', 'false');
        this.trigger.setAttribute('aria-expanded', 'true');
    };
    return Toggletip;
}());
exports.Toggletip = Toggletip;
//# sourceMappingURL=toggletip.js.map