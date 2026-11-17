export class AmountSelection {
    customAmountInput: HTMLInputElement;
    radioInputs: HTMLInputElement[];
    inputBlurHandlers: Function[];
    radioSelectHandlers: Function[];
    customAmountRadio?: HTMLInputElement;

    constructor(customAmountInput: HTMLInputElement, radioInputs: HTMLInputElement[], customAmountRadio?: HTMLInputElement) {
        this.customAmountInput = customAmountInput;
        this.radioInputs = radioInputs;
        this.customAmountRadio = customAmountRadio;
        this.inputBlurHandlers = [];
        this.radioSelectHandlers = [];
        this.customAmountInput.addEventListener('blur', this.inputBlurred.bind(this));
        this.customAmountInput.addEventListener('change', this.inputChanged.bind(this));
    }

    on(event: string, handler: Function) {
        switch (event) {
            case "inputBlur":
                return this.inputBlurHandlers.push(handler);
            case "radioSelect":
                return this.radioSelectHandlers.push(handler);
        }
    }

    inputChanged() {
        const newValue = parseInt(this.customAmountInput.value);
        if (newValue) {
            this.customAmountRadio.value = `${newValue}`;
        }
    }

    inputBlurred() {
        const newValue = parseInt(this.customAmountInput.value);
        if (newValue <= 0) {
            this.customAmountInput.value = null;
        }
        else {
            this.customAmountRadio.checked = true;
        }
        if (this.inputBlurHandlers) {
            this.inputBlurHandlers.forEach(handler => {
                setTimeout(handler.bind(this), 0);
            })
        }
    }
}