"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevealPanel = void 0;
var enableTabbableChildren_1 = require("../helpers/enableTabbableChildren");
var disableTabbableChildren_1 = require("../helpers/disableTabbableChildren");
var getHeightOfHidden_1 = require("../helpers/getHeightOfHidden");
var lodash_1 = require("lodash");
var transitionSpeed = 300;
var defaultPanelAttribute = 'data-panel';
var openClass = 'opened';
var RevealPanel = /** @class */ (function () {
    function RevealPanel(panel) {
        var _this = this;
        var _a;
        var panelId = typeof panel == 'string' ? panel : panel.id;
        this.panel = document.querySelector("#" + panelId);
        this.triggers = [].slice.call(document.querySelectorAll("[aria-controls=\"" + panelId + "\"]"));
        this.childPanels = [].slice.call(this.panel.querySelectorAll("[" + defaultPanelAttribute + "]"));
        this.clearInputsOnClose = ((_a = this.panel.getAttribute('data-clear-inputs-on-close')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'true';
        this.isOpen = false;
        this.openHandlers = [];
        this.closeHandlers = [];
        this.afterCloseHandlers = [];
        if (this.clearInputsOnClose) {
            // We're not getting select elements here, because there's much more logic at play for state/country select states and we don't need to make them blank
            this.inputChildren = [].slice.call(this.panel.querySelectorAll('input, textarea'));
        }
        window.addEventListener('resize', lodash_1.debounce(function () {
            _this.setPanelHeight();
        }, 100));
        this.triggers.forEach(function (trigger) {
            if (!trigger.matches('input[type="checkbox"] + label, input[type="radio"] + label, input[type="checkbox"] + input[type="hidden"] + label, input[type="radio"] + input[type="hidden"] + label')) {
                _this.initButtonTrigger(trigger);
            }
            else {
                _this.initRadioOrCheckboxTrigger(trigger);
            }
        });
    }
    RevealPanel.prototype.initButtonTrigger = function (trigger) {
        trigger.addEventListener('click', this.triggerClick.bind(this));
        this.initClosedPanel();
    };
    RevealPanel.prototype.initRadioOrCheckboxTrigger = function (trigger) {
        var _this = this;
        var triggerInput = trigger.previousElementSibling;
        if (triggerInput.getAttribute('type') == 'hidden') {
            triggerInput = triggerInput.previousElementSibling;
        }
        var inputGroup = [].slice.call(document.querySelectorAll("[type=\"radio\"][name=\"" + triggerInput.name + "\"], [type=\"checkbox\"][name=\"" + triggerInput.name + "\"]"));
        if (triggerInput.checked) {
            this.initOpenPanel();
        }
        else {
            this.initClosedPanel();
        }
        inputGroup.forEach(function (inputInGroup) {
            inputInGroup.addEventListener('change', function () {
                if (triggerInput.checked) {
                    if (!_this.isOpen) {
                        _this.openPanel();
                    }
                }
                else {
                    if (_this.isOpen) {
                        _this.closePanel();
                    }
                }
            });
        });
    };
    RevealPanel.prototype.initOpenPanel = function () {
        var _this = this;
        setTimeout(function () {
            _this.setPanelHeight();
            _this.openPanel();
        }, 0);
    };
    RevealPanel.prototype.initClosedPanel = function () {
        var _this = this;
        setTimeout(function () {
            _this.setPanelHeight();
            _this.closePanel();
        }, 0);
    };
    RevealPanel.prototype.on = function (event, handler) {
        switch (event) {
            case "open":
                return this.openHandlers.push(handler);
            case "close":
                return this.closeHandlers.push(handler);
            case "afterClose":
                return this.afterCloseHandlers.push(handler);
        }
    };
    RevealPanel.prototype.setPanelHeight = function (childPanel) {
        if (childPanel) {
            var childPanelHeight = getHeightOfHidden_1.getHeightOfHidden(childPanel);
            childPanel.style.height = childPanelHeight + "px";
        }
        else {
            var panelHeight = getHeightOfHidden_1.getHeightOfHidden(this.panel);
            this.panel.style.height = panelHeight + "px";
        }
    };
    RevealPanel.prototype.triggerClick = function (e) {
        if (this.isOpen) {
            this.closePanel();
        }
        else {
            this.openPanel();
        }
    };
    RevealPanel.prototype.openPanel = function () {
        var _this = this;
        var handleOpen = function () {
            if (_this.isOpen) {
                _this.panel.style.overflow = 'visible';
                _this.childPanels.forEach(function (childPanel) {
                    _this.setPanelHeight(childPanel);
                });
                _this.panel.classList.add(openClass);
            }
        };
        setTimeout(function () {
            handleOpen();
            if (_this.openHandlers.length > 0) {
                _this.openHandlers.forEach(function (handler) {
                    requestAnimationFrame(handler.bind(_this));
                });
            }
        }, transitionSpeed);
        this.triggers.forEach(function (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
        });
        this.panel.setAttribute('aria-hidden', 'false');
        enableTabbableChildren_1.enableTabbableChildren(this.panel);
        this.isOpen = true;
    };
    RevealPanel.prototype.closePanel = function () {
        var _this = this;
        this.panel.classList.remove(openClass);
        if (this.clearInputsOnClose) {
            this.clearChildInputs();
        }
        if (this.closeHandlers.length > 0) {
            this.closeHandlers.forEach(function (handler) {
                handler();
            });
        }
        requestAnimationFrame(function () {
            _this.panel.style.overflow = '';
            _this.triggers.forEach(function (trigger) {
                trigger.setAttribute('aria-expanded', 'false');
            });
            _this.panel.setAttribute('aria-hidden', 'true');
            disableTabbableChildren_1.disableTabbableChildren(_this.panel);
            _this.isOpen = false;
        });
        if (this.afterCloseHandlers.length > 0) {
            this.afterCloseHandlers.forEach(function (handler) {
                setTimeout(function () {
                    requestAnimationFrame(handler.bind(_this));
                }, transitionSpeed);
            });
        }
    };
    RevealPanel.prototype.clearChildInputs = function () {
        this.inputChildren.forEach(function (field) {
            var changeEvent = new Event('change');
            var fieldType = field.getAttribute('type');
            if (fieldType == 'radio' || fieldType == 'checkbox') {
                field.checked = false;
            }
            else if (fieldType != 'hidden') {
                field.value = '';
            }
            field.dispatchEvent(changeEvent);
        });
    };
    return RevealPanel;
}());
exports.RevealPanel = RevealPanel;
//# sourceMappingURL=revealPanel.js.map