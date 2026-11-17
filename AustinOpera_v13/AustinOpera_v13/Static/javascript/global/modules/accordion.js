"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accordion = void 0;
var enableTabbableChildren_1 = require("../helpers/enableTabbableChildren");
var disableTabbableChildren_1 = require("../helpers/disableTabbableChildren");
var getHeightOfHidden_1 = require("../helpers/getHeightOfHidden");
var lodash_1 = require("lodash");
var Accordion = /** @class */ (function () {
    function Accordion(options) {
        var _this = this;
        this.options = {
            oneOpenAtATime: true
        };
        lodash_1.assign(this.options, options);
        this.container = this.options.container;
        this.panels = [].slice.call(this.container.querySelectorAll('[role="region"]'));
        this.triggers = [].slice.call(this.container.querySelectorAll('[aria-controls]'));
        window.addEventListener('resize', lodash_1.debounce(function () {
            _this.setAccordionHeights();
        }, 100));
        this.container.addEventListener('keydown', this.handleKeydown.bind(this));
        this.triggers.forEach(function (trigger) {
            trigger.addEventListener('click', _this.accordionClick.bind(_this));
        });
        this.panels.forEach(function (panel) {
            disableTabbableChildren_1.disableTabbableChildren(panel);
        });
        setTimeout(function () {
            _this.setAccordionHeights();
        }, 0);
    }
    Accordion.prototype.setAccordionHeights = function () {
        this.panels.forEach(function (panel) {
            // override css styles so that we can capture the actual height of the collapsed panel
            var panelHeight = getHeightOfHidden_1.getHeightOfHidden(panel);
            panel.style.height = panelHeight + "px";
        });
    };
    Accordion.prototype.accordionClick = function (e) {
        this.activePanel = this.container.querySelector("#" + e.target.getAttribute('aria-controls'));
        this.activeTrigger = e.target;
        this.toggleActivePanel();
        if (this.options.oneOpenAtATime) {
            this.closeInactivePanels();
        }
    };
    Accordion.prototype.toggleActivePanel = function () {
        if (this.activeTrigger.getAttribute('aria-expanded') === 'true') {
            this.closePanel(this.activeTrigger, this.activePanel);
        }
        else {
            this.openPanel(this.activeTrigger, this.activePanel);
        }
        if (this.options.oneOpenAtATime) {
            this.closeInactivePanels();
        }
    };
    Accordion.prototype.closeInactivePanels = function () {
        var _this = this;
        this.triggers.forEach(function (trigger) {
            if (trigger !== _this.activeTrigger) {
                var curPanel = _this.container.querySelector("#" + trigger.getAttribute('aria-controls'));
                _this.closePanel(trigger, curPanel);
            }
        });
    };
    Accordion.prototype.openPanel = function (trigger, panel) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        enableTabbableChildren_1.enableTabbableChildren(panel);
    };
    Accordion.prototype.closePanel = function (trigger, panel) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        disableTabbableChildren_1.disableTabbableChildren(panel);
    };
    Accordion.prototype.handleKeydown = function (e) {
        var _this = this;
        var key = e.which.toString();
        var target = e.target;
        var ctrlModifier = (e.ctrlKey && key.match(/33|34/));
        if (target.hasAttribute('aria-controls')) {
            if (key.match(/38|40/) || ctrlModifier) {
                var index = this.triggers.indexOf(target);
                var direction = (key.match(/34|40/)) ? 1 : -1;
                var length_1 = this.triggers.length;
                var newIndex = (index + length_1 + direction) % length_1;
                this.triggers[newIndex].focus();
                e.preventDefault();
            }
            else if (key.match(/35|36/)) {
                // 35 = End, 36 = Home keyboard operations
                switch (key) {
                    // Go to first accordion
                    case '36':
                        this.triggers[0].focus();
                        break;
                    // Go to last accordion
                    case '35':
                        this.triggers[this.triggers.length - 1].focus();
                        break;
                }
                e.preventDefault();
            }
        }
        else if (ctrlModifier) {
            // Control + Page Up/ Page Down keyboard operations
            // Catches events that happen inside of panels
            this.panels.forEach(function (panel, index) {
                if (panel.contains(target)) {
                    _this.triggers[index].focus();
                    e.preventDefault();
                }
            });
        }
    };
    return Accordion;
}());
exports.Accordion = Accordion;
//# sourceMappingURL=accordion.js.map