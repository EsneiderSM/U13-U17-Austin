export interface ITabOptions {
    container?: HTMLElement;
}

export class Tabs {
    options: ITabOptions;
    container: HTMLElement;
    panels: Array<HTMLElement>;
    tabs: Array<HTMLButtonElement>;
    delay: number;
    keys: any;
    direction: any;
    tabSwitchHandlers: Array<any>;

    constructor(options: ITabOptions) {
        // Most of this is from the WAI-ARIA Authoring Guide and revised for TS https://www.w3.org/TR/wai-aria-practices-1.1/examples/tabs/tabs-1/tabs.html
        this.options = options;
        this.container = options.container;
        this.delay = this.determineDelay();
        this.tabs = [].slice.call(this.container.querySelectorAll('[role="tab"]'));
        this.panels = [].slice.call(this.container.querySelectorAll('[role="tabpanel"]'));
        const hasPagination = this.container.getAttribute('data-tabs-pagination') == "true";
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
        }

        // Bind listeners
        this.tabs.forEach(tab => {
            tab.addEventListener('click', this.clickEventListener.bind(this));
            tab.addEventListener('keydown', this.keydownEventListener.bind(this));
            tab.addEventListener('keyup', this.keyupEventListener.bind(this));
        });

        if (hasPagination) {
            this.attachPagination();
        }
    }

    on(event, handler) {
        switch (event) {
            case "tabSwitch":
                return this.tabSwitchHandlers.push(handler);
        }
    }

    attachPagination() {
        this.panels.forEach((panel, index) => {
            let buttonContainer = document.createElement('div');
            buttonContainer.className = `adage-block tabs-pagination`;
            if (index > 0) {
                // attach previous button
                let nextButton = this.duplicateTabForPagination(this.tabs[index - 1], "previous");
                buttonContainer.appendChild(nextButton);
            }
            if (index < (this.panels.length - 1)) {
                // attach next button
                let nextButton = this.duplicateTabForPagination(this.tabs[index + 1], "next");
                buttonContainer.appendChild(nextButton);
            }
            panel.appendChild(buttonContainer);
        })
    }

    duplicateTabForPagination(tab: HTMLButtonElement, suffix: string) {
        let newButton = tab.cloneNode(true) as HTMLButtonElement;
        newButton.setAttribute('data-related-tab', newButton.id);
        newButton.id = `${newButton.id}_${suffix}`;
        newButton.removeAttribute('aria-setsize');
        newButton.removeAttribute('aria-posinset');
        newButton.removeAttribute('role');
        newButton.removeAttribute('aria-selected');
        newButton.removeAttribute('tabindex');
        newButton.className = `tabs-pagination-btn`;
        newButton.addEventListener('click', this.clickEventListener.bind(this));
        let buttonWrapper = document.createElement('div');
        buttonWrapper.className = `tabs-pagination-${suffix}`;
        buttonWrapper.appendChild(newButton);
        return buttonWrapper;
    }

    // When a tab is clicked, activateTab is fired to activate it
    clickEventListener(event) {
        let tab = event.target;
        if (tab.getAttribute('data-related-tab')) {
            tab = this.container.querySelector('#' + tab.getAttribute('data-related-tab'));
        }

        this.activateTab(tab, false);
    }

    // Handle keydown on tabs
    keydownEventListener(event) {
        const key = event.keyCode;

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
    }

    // Handle keyup on tabs
    keyupEventListener(event) {
        const key = event.keyCode;

        switch (key) {
            case this.keys.left:
            case this.keys.right:
                this.switchTabOnArrowPress(event);
                break;
        }
    }

    // Either focus the next, previous, first, or last tab
    // depening on key pressed
    switchTabOnArrowPress(event) {
        const pressed = event.keyCode;

        this.tabs.forEach(tab => {
            tab.addEventListener('focus', this.focusEventHandler.bind(this));
        });

        if (this.direction[pressed]) {
            const target = event.target;
            const index = parseInt(target.getAttribute('aria-posinset')) - 1;
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
    }

    // Activates any given tab panel
    activateTab(tab, setFocus) {
        setFocus = setFocus || true;
        // Deactivate all other tabs
        this.deactivateTabs();

        // Remove tabindex attribute
        tab.removeAttribute('tabindex');

        // Set the tab as selected
        tab.setAttribute('aria-selected', 'true');

        // Get the value of aria-controls (which is an ID)
        const controls = tab.getAttribute('aria-controls');

        // Remove hidden attribute from tab panel to make it visible
        document.getElementById(controls).removeAttribute('hidden');

        // Set focus when required
        if (setFocus) {
            tab.focus();
        }

        if (this.tabSwitchHandlers) {
            this.tabSwitchHandlers.forEach(handler => {
                setTimeout(handler.bind(this), 0);
            })
        }
    }

    // Deactivate all tabs and tab panels
    deactivateTabs() {
        this.tabs.forEach(tab => {
            tab.setAttribute('tabindex', '-1');
            tab.setAttribute('aria-selected', 'false');
            tab.removeEventListener('focus', this.focusEventHandler.bind(this));
        })
        this.panels.forEach(panel => {
            panel.setAttribute('hidden', 'hidden');
        })
    }

    // Make a guess
    focusFirstTab() {
        this.tabs[0].focus();
    }

    // Make a guess
    focusLastTab() {
        this.tabs[this.tabs.length - 1].focus();
    }

    // Determine whether there should be a delay
    // when user navigates with the arrow keys
    determineDelay() {
        const hasDelay = this.container.hasAttribute('data-delay');
        let delay = 0;

        if (hasDelay) {
            const delayValue = parseInt(this.container.getAttribute('data-delay'));
            if (delayValue) {
                delay = delayValue;
            }
            else {
                // If no value is specified, default to 300ms
                delay = 300;
            }
        }

        return delay;
    }

    //
    focusEventHandler(event) {
        const target = event.target;

        setTimeout(this.checkTabFocus.bind(this), this.delay, target);
    }

    // Only activate tab on focus if it still has focus after the delay
    checkTabFocus(target) {
        const focused = document.activeElement;

        if (target === focused) {
            this.activateTab(target, false);
        }
    }

    getActiveTabPanel() {
        let selected = this.panels[0];
        this.tabs.forEach((tab, index) => {
            if (this.tabs[index].getAttribute('aria-selected') == 'true') {
                selected = this.panels[index];
            }
        });
        return selected;
    }

    getActiveTabIndex() {
        let selected = 0;
        this.tabs.forEach((tab, index) => {
            if (this.tabs[index].getAttribute('aria-selected') == 'true') {
                selected = index;
            }
        });
        return selected;
    }

}