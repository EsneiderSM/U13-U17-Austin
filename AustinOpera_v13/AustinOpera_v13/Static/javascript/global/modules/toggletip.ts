const toggletipSelector = '[data-toggletip]';

export class Toggletip {
    trigger: HTMLButtonElement;
    panel: HTMLElement;
    closeButton: HTMLButtonElement;

    constructor(panel: HTMLElement) {
        const id = panel.id;
        this.panel = panel;
        this.trigger = document.querySelector(`[aria-describedby="${id}"]`) as HTMLButtonElement;
        this.closeButton = document.querySelector(`[aria-controls="${id}"]`) as HTMLButtonElement;

        this.closeButton.addEventListener('click', this.hide.bind(this));
        this.trigger.addEventListener('click', () => {
            if (this.trigger.getAttribute('aria-expanded') == 'true') this.hide();
            else this.show();
        });
        this.hide();
    }

    hide() {
        this.panel.setAttribute('aria-hidden', 'true');
        this.trigger.setAttribute('aria-expanded', 'false');
    }

    show() {
        const openToggletip = document.querySelector(`${toggletipSelector}[aria-hidden="false"]`) as HTMLElement;
        if (openToggletip) {
            const id = openToggletip.id;
            const trigger = document.querySelector(`[aria-describedby="${id}"]`) as HTMLButtonElement;
            openToggletip.setAttribute('aria-hidden', 'true');
            trigger.setAttribute('aria-expanded', 'false');
        }
        this.panel.setAttribute('aria-hidden', 'false');
        this.trigger.setAttribute('aria-expanded', 'true');
    }
}