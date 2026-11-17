import { enableTabbableChildren } from '../helpers/enableTabbableChildren';
import { disableTabbableChildren } from '../helpers/disableTabbableChildren';
import { getHeightOfHidden } from '../helpers/getHeightOfHidden';
import { debounce } from 'lodash';

const transitionSpeed = 300;
const defaultPanelAttribute = 'data-panel';
const openClass = 'opened';

export class RevealPanel {
    triggers: Array<HTMLButtonElement>;
    panel: HTMLElement;
    isOpen: boolean;
    childPanels: Array<HTMLElement>;
    clearInputsOnClose?: boolean;
    inputChildren?: Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
    openHandlers?: Array<any>;
    closeHandlers?: Array<any>;
    afterCloseHandlers?: Array<any>;

    constructor(panel: HTMLElement | string) {
        let panelId = typeof panel == 'string' ? panel : (panel as HTMLElement).id;
        this.panel = document.querySelector(`#${panelId}`);
        this.triggers = [].slice.call(document.querySelectorAll(`[aria-controls="${panelId}"]`));
        this.childPanels = [].slice.call(this.panel.querySelectorAll(`[${defaultPanelAttribute}]`));
        this.clearInputsOnClose = this.panel.getAttribute('data-clear-inputs-on-close')?.toLowerCase() === 'true';
        this.isOpen = false;
        this.openHandlers = [];
        this.closeHandlers = [];
        this.afterCloseHandlers = [];

        if (this.clearInputsOnClose) {
            // We're not getting select elements here, because there's much more logic at play for state/country select states and we don't need to make them blank
            this.inputChildren = [].slice.call(this.panel.querySelectorAll('input, textarea'));
        }

        window.addEventListener(
            'resize',
            debounce(() => {
                this.setPanelHeight();
            }, 100)
        );

        this.triggers.forEach(trigger => {
            if (!trigger.matches('input[type="checkbox"] + label, input[type="radio"] + label, input[type="checkbox"] + input[type="hidden"] + label, input[type="radio"] + input[type="hidden"] + label')) {
                this.initButtonTrigger(trigger);
            }
            else {
                this.initRadioOrCheckboxTrigger(trigger);
            }
        });
    }

    initButtonTrigger(trigger: HTMLButtonElement) {
        trigger.addEventListener('click', this.triggerClick.bind(this));
        this.initClosedPanel();
    }

    initRadioOrCheckboxTrigger(trigger) {
        let triggerInput = trigger.previousElementSibling as HTMLInputElement;
        if (triggerInput.getAttribute('type') == 'hidden') {
            triggerInput = triggerInput.previousElementSibling as HTMLInputElement;
        }
        const inputGroup = [].slice.call(document.querySelectorAll(`[type="radio"][name="${triggerInput.name}"], [type="checkbox"][name="${triggerInput.name}"]`));
        if (triggerInput.checked) {
            this.initOpenPanel();
        }
        else {
            this.initClosedPanel();
        }
        inputGroup.forEach(inputInGroup => {
            inputInGroup.addEventListener('change', () => {
                if (triggerInput.checked) {
                    if (!this.isOpen) {
                        this.openPanel();
                    }
                }
                else {
                    if (this.isOpen) {
                        this.closePanel();
                    }
                }
            })
        })
    }

    initOpenPanel() {
        setTimeout(() => {
            this.setPanelHeight();
            this.openPanel();
        }, 0);
    }

    initClosedPanel() {
        setTimeout(() => {
            this.setPanelHeight();
            this.closePanel();
        }, 0);
    }

    on(event, handler) {
        switch (event) {
            case "open":
                return this.openHandlers.push(handler);
            case "close":
                return this.closeHandlers.push(handler);
            case "afterClose":
                return this.afterCloseHandlers.push(handler);
        }
    }

    setPanelHeight(childPanel?: HTMLElement) {
        if (childPanel) {
            const childPanelHeight = getHeightOfHidden(childPanel);
            childPanel.style.height = `${childPanelHeight}px`;
        }
        else {
            const panelHeight = getHeightOfHidden(this.panel);
            this.panel.style.height = `${panelHeight}px`;
        }
    }

    triggerClick(e) {
        if (this.isOpen) {
            this.closePanel();
        }
        else {
            this.openPanel();
        }
    }

    openPanel() {
        let handleOpen = () => {
            if (this.isOpen) {
                this.panel.style.overflow = 'visible';
                this.childPanels.forEach(childPanel => {
                    this.setPanelHeight(childPanel);
                });
                this.panel.classList.add(openClass);
            }
        }
        setTimeout(() => {
            handleOpen();
            if (this.openHandlers.length > 0) {
                this.openHandlers.forEach(handler => {
                    requestAnimationFrame(handler.bind(this));
                })
            }
        }, transitionSpeed);
        this.triggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'true');
        });
        this.panel.setAttribute('aria-hidden', 'false');
        enableTabbableChildren(this.panel);
        this.isOpen = true;
    }

    closePanel() {
        this.panel.classList.remove(openClass);

        if (this.clearInputsOnClose) {
            this.clearChildInputs();
        }

        if (this.closeHandlers.length > 0) {
            this.closeHandlers.forEach(handler => {
                handler();
            });
        }

        requestAnimationFrame(() => {
            this.panel.style.overflow = '';
            this.triggers.forEach(trigger => {
                trigger.setAttribute('aria-expanded', 'false');
            });
            this.panel.setAttribute('aria-hidden', 'true');
            disableTabbableChildren(this.panel);
            this.isOpen = false;
        });

        if (this.afterCloseHandlers.length > 0) {
            this.afterCloseHandlers.forEach(handler => {
                setTimeout(() => {
                    requestAnimationFrame(handler.bind(this));
                }, transitionSpeed);
            });
        }
    }

    clearChildInputs() {
        this.inputChildren.forEach(field => {
            const changeEvent = new Event('change');
            const fieldType = field.getAttribute('type');

            if (fieldType == 'radio' || fieldType == 'checkbox') {
                (field as HTMLInputElement).checked = false;
            }
            else if(fieldType != 'hidden') {
                (field as HTMLInputElement).value = '';
            }

            field.dispatchEvent(changeEvent);
        });
    }
}