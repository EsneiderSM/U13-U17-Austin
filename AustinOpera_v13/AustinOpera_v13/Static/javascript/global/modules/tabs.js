"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tabs = void 0;
var Tabs = /** @class */ (function () {
    function Tabs(options) {
        var _this = this;
        // Most of this is from the WAI-ARIA Authoring Guide and revised for TS https://www.w3.org/TR/wai-aria-practices-1.1/examples/tabs/tabs-1/tabs.html
        this.options = options;
        this.container = options.container;
        this.delay = this.determineDelay();
        this.tabs = [].slice.call(this.container.querySelectorAll('[role="tab"]'));
        this.panels = [].slice.call(this.container.querySelectorAll('[role="tabpanel"]'));
        var hasPagination = this.container.getAttribute('data-tabs-pagination') == "true";
        this.tabSwitchHandlers = [];
        // For easy reference
        this.keys = {
            end: 35,
            home: 36,
            left: 37,
            right: 39
        };
        // Add or substract depending on key pressed
        this.direction = {
            37: -1,
            39: 1
        };
        // Bind listeners
        this.tabs.forEach(function (tab) {
            tab.addEventListener('click', _this.clickEventListener.bind(_this));
            tab.addEventListener('keydown', _this.keydownEventListener.bind(_this));
            tab.addEventListener('keyup', _this.keyupEventListener.bind(_this));
        });
        if (hasPagination) {
            this.attachPagination();
        }
    }
    Tabs.prototype.on = function (event, handler) {
        switch (event) {
            case "tabSwitch":
                return this.tabSwitchHandlers.push(handler);
        }
    };
    Tabs.prototype.attachPagination = function () {
        var _this = this;
        this.panels.forEach(function (panel, index) {
            var buttonContainer = document.createElement('div');
            buttonContainer.className = "adage-block tabs-pagination";
            if (index > 0) {
                // attach previous button
                var nextButton = _this.duplicateTabForPagination(_this.tabs[index - 1], "previous");
                buttonContainer.appendChild(nextButton);
            }
            if (index < (_this.panels.length - 1)) {
                // attach next button
                var nextButton = _this.duplicateTabForPagination(_this.tabs[index + 1], "next");
                buttonContainer.appendChild(nextButton);
            }
            panel.appendChild(buttonContainer);
        });
    };
    Tabs.prototype.duplicateTabForPagination = function (tab, suffix) {
        var newButton = tab.cloneNode(true);
        newButton.setAttribute('data-related-tab', newButton.id);
        newButton.id = newButton.id + "_" + suffix;
        newButton.removeAttribute('aria-setsize');
        newButton.removeAttribute('aria-posinset');
        newButton.removeAttribute('role');
        newButton.removeAttribute('aria-selected');
        newButton.removeAttribute('tabindex');
        newButton.className = "tabs-pagination-btn";
        newButton.addEventListener('click', this.clickEventListener.bind(this));
        var buttonWrapper = document.createElement('div');
        buttonWrapper.className = "tabs-pagination-" + suffix;
        buttonWrapper.appendChild(newButton);
        return buttonWrapper;
    };
    // When a tab is clicked, activateTab is fired to activate it
    Tabs.prototype.clickEventListener = function (event) {
        var tab = event.target;
        if (tab.getAttribute('data-related-tab')) {
            tab = this.container.querySelector('#' + tab.getAttribute('data-related-tab'));
        }
        this.activateTab(tab, false);
    };
    // Handle keydown on tabs
    Tabs.prototype.keydownEventListener = function (event) {
        var key = event.keyCode;
        switch (key) {
            case this.keys.end:
                event.preventDefault();
                // Activate last tab
                this.activateTab(this.tabs[this.tabs.length - 1], true);
                break;
            case this.keys.home:
                event.preventDefault();
                // Activate first tab
                this.activateTab(this.tabs[0], true);
                break;
        }
    };
    // Handle keyup on tabs
    Tabs.prototype.keyupEventListener = function (event) {
        var key = event.keyCode;
        switch (key) {
            case this.keys.left:
            case this.keys.right:
                this.switchTabOnArrowPress(event);
                break;
        }
    };
    // Either focus the next, previous, first, or last tab
    // depening on key pressed
    Tabs.prototype.switchTabOnArrowPress = function (event) {
        var _this = this;
        var pressed = event.keyCode;
        this.tabs.forEach(function (tab) {
            tab.addEventListener('focus', _this.focusEventHandler.bind(_this));
        });
        if (this.direction[pressed]) {
            var target = event.target;
            var index = parseInt(target.getAttribute('aria-posinset')) - 1;
            if (index !== undefined) {
                if (this.tabs[index + this.direction[pressed]]) {
                    this.tabs[index + this.direction[pressed]].focus();
                }
                else if (pressed === this.keys.left || pressed === this.keys.up) {
                    this.focusLastTab();
                }
                else if (pressed === this.keys.right || pressed == this.keys.down) {
                    this.focusFirstTab();
                }
            }
        }
    };
    // Activates any given tab panel
    Tabs.prototype.activateTab = function (tab, setFocus) {
        var _this = this;
        setFocus = setFocus || true;
        // Deactivate all other tabs
        this.deactivateTabs();
        // Remove tabindex attribute
        tab.removeAttribute('tabindex');
        // Set the tab as selected
        tab.setAttribute('aria-selected', 'true');
        // Get the value of aria-controls (which is an ID)
        var controls = tab.getAttribute('aria-controls');
        // Remove hidden attribute from tab panel to make it visible
        document.getElementById(controls).removeAttribute('hidden');
        // Set focus when required
        if (setFocus) {
            tab.focus();
        }
        if (this.tabSwitchHandlers) {
            this.tabSwitchHandlers.forEach(function (handler) {
                setTimeout(handler.bind(_this), 0);
            });
        }
    };
    // Deactivate all tabs and tab panels
    Tabs.prototype.deactivateTabs = function () {
        var _this = this;
        this.tabs.forEach(function (tab) {
            tab.setAttribute('tabindex', '-1');
            tab.setAttribute('aria-selected', 'false');
            tab.removeEventListener('focus', _this.focusEventHandler.bind(_this));
        });
        this.panels.forEach(function (panel) {
            panel.setAttribute('hidden', 'hidden');
        });
    };
    // Make a guess
    Tabs.prototype.focusFirstTab = function () {
        this.tabs[0].focus();
    };
    // Make a guess
    Tabs.prototype.focusLastTab = function () {
        this.tabs[this.tabs.length - 1].focus();
    };
    // Determine whether there should be a delay
    // when user navigates with the arrow keys
    Tabs.prototype.determineDelay = function () {
        var hasDelay = this.container.hasAttribute('data-delay');
        var delay = 0;
        if (hasDelay) {
            var delayValue = parseInt(this.container.getAttribute('data-delay'));
            if (delayValue) {
                delay = delayValue;
            }
            else {
                // If no value is specified, default to 300ms
                delay = 300;
            }
        }
        return delay;
    };
    //
    Tabs.prototype.focusEventHandler = function (event) {
        var target = event.target;
        setTimeout(this.checkTabFocus.bind(this), this.delay, target);
    };
    // Only activate tab on focus if it still has focus after the delay
    Tabs.prototype.checkTabFocus = function (target) {
        var focused = document.activeElement;
        if (target === focused) {
            this.activateTab(target, false);
        }
    };
    Tabs.prototype.getActiveTabPanel = function () {
        var _this = this;
        var selected = this.panels[0];
        this.tabs.forEach(function (tab, index) {
            if (_this.tabs[index].getAttribute('aria-selected') == 'true') {
                selected = _this.panels[index];
            }
        });
        return selected;
    };
    Tabs.prototype.getActiveTabIndex = function () {
        var _this = this;
        var selected = 0;
        this.tabs.forEach(function (tab, index) {
            if (_this.tabs[index].getAttribute('aria-selected') == 'true') {
                selected = index;
            }
        });
        return selected;
    };
    return Tabs;
}());
exports.Tabs = Tabs;
//# sourceMappingURL=tabs.js.map