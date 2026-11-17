import { enableTabbableChildren } from '../helpers/enableTabbableChildren';
import { disableTabbableChildren } from '../helpers/disableTabbableChildren';
import { getHeightOfHidden } from '../helpers/getHeightOfHidden';
import { debounce, assign } from 'lodash';

export interface IAccordionOptions {
    container?: HTMLElement;
    oneOpenAtATime: boolean;
}

export class Accordion {
    options: IAccordionOptions = {
        oneOpenAtATime: true
    }

    container: HTMLElement;
    panels: Array<HTMLElement>;
    triggers: Array<HTMLButtonElement>;
    activePanel: any;
    activeTrigger: any;

    constructor(options: IAccordionOptions) {
        assign(this.options, options);
        this.container = this.options.container;
        this.panels = [].slice.call(this.container.querySelectorAll('[role="region"]'));
        this.triggers = [].slice.call(this.container.querySelectorAll('[aria-controls]'));

        window.addEventListener(
            'resize',
            debounce(() => {
                this.setAccordionHeights();
            }, 100)
        );

        this.container.addEventListener('keydown', this.handleKeydown.bind(this));

        this.triggers.forEach(trigger => {
            trigger.addEventListener('click', this.accordionClick.bind(this));
        });
        this.panels.forEach(panel => {
            disableTabbableChildren(panel);
        });
        setTimeout(() => {
            this.setAccordionHeights();
        }, 0);
    }

    setAccordionHeights() {
        this.panels.forEach(panel => {
            // override css styles so that we can capture the actual height of the collapsed panel
            const panelHeight = getHeightOfHidden(panel);
            panel.style.height = `${panelHeight}px`;
        });
    }

    accordionClick(e) {
        this.activePanel = this.container.querySelector(`#${e.target.getAttribute('aria-controls')}`);
        this.activeTrigger = e.target;
        this.toggleActivePanel();
        if (this.options.oneOpenAtATime) {
            this.closeInactivePanels();
        }
    }

    toggleActivePanel() {
        if (this.activeTrigger.getAttribute('aria-expanded') === 'true') {
            this.closePanel(this.activeTrigger, this.activePanel);
        }
        else {
            this.openPanel(this.activeTrigger, this.activePanel);
        }
        if (this.options.oneOpenAtATime) {
            this.closeInactivePanels();
        }
    }

    closeInactivePanels() {
        this.triggers.forEach(trigger => {
            if (trigger !== this.activeTrigger) {
                const curPanel = this.container.querySelector(`#${trigger.getAttribute('aria-controls')}`);
                this.closePanel(trigger, curPanel);
            }
        });
    }

    openPanel(trigger, panel) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        enableTabbableChildren(panel);
    }

    closePanel(trigger, panel) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        disableTabbableChildren(panel);
    }

    handleKeydown(e) { // mostly taken from WAI-ARIA Authoring guide: https://w3c.github.io/aria-practices/examples/accordion/accordion.html
        const key = e.which.toString();
        const target = e.target;
        const ctrlModifier = (e.ctrlKey && key.match(/33|34/));
        if (target.hasAttribute('aria-controls')) {
            if (key.match(/38|40/) || ctrlModifier) {
                const index = this.triggers.indexOf(target);
                const direction = (key.match(/34|40/)) ? 1 : -1;
                const length = this.triggers.length;
                const newIndex = (index + length + direction) % length;

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
            this.panels.forEach((panel, index) => {
                if (panel.contains(target)) {
                    this.triggers[index].focus();

                    e.preventDefault();
                }
            });
        }
    }
}