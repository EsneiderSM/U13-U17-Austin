"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmountSelection = void 0;
var AmountSelection = /** @class */ (function () {
    function AmountSelection(customAmountInput, radioInputs, customAmountRadio) {
        this.customAmountInput = customAmountInput;
        this.radioInputs = radioInputs;
        this.customAmountRadio = customAmountRadio;
        this.inputBlurHandlers = [];
        this.radioSelectHandlers = [];
        this.customAmountInput.addEventListener('blur', this.inputBlurred.bind(this));
        this.customAmountInput.addEventListener('change', this.inputChanged.bind(this));
    }
    AmountSelection.prototype.on = function (event, handler) {
        switch (event) {
            case "inputBlur":
                return this.inputBlurHandlers.push(handler);
            case "radioSelect":
                return this.radioSelectHandlers.push(handler);
        }
    };
    AmountSelection.prototype.inputChanged = function () {
        var newValue = parseInt(this.customAmountInput.value);
        if (newValue) {
            this.customAmountRadio.value = "" + newValue;
        }
    };
    AmountSelection.prototype.inputBlurred = function () {
        var _this = this;
        var newValue = parseInt(this.customAmountInput.value);
        if (newValue <= 0) {
            this.customAmountInput.value = null;
        }
        else {
            this.customAmountRadio.checked = true;
        }
        if (this.inputBlurHandlers) {
            this.inputBlurHandlers.forEach(function (handler) {
                setTimeout(handler.bind(_this), 0);
            });
        }
    };
    return AmountSelection;
}());
exports.AmountSelection = AmountSelection;
//# sourceMappingURL=amount-selection.js.map