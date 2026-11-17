import * as A11yDialog from 'a11y-dialog';
import { lockBody, unlockBody } from '../helpers/lockBody';

export class Modal {
    modal: any;
    modalElement: HTMLElement;
    bodyStyles: string;

    constructor(modalElement: HTMLElement, container?: HTMLElement) {
        if (container != null) {
            this.modal = new A11yDialog(modalElement as Element, container as Element);
        }
        else {
            this.modal = new A11yDialog(modalElement as Element);
        }
        this.modalElement = modalElement;
        this.modal.on('show', () => {
            this.bodyStyles = lockBody();
        });
        this.modal.on('hide', () => {
            unlockBody(this.bodyStyles);
        });
    }
}