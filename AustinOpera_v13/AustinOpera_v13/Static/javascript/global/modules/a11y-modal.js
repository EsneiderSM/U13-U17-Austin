"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = void 0;
var A11yDialog = __importStar(require("a11y-dialog"));
var lockBody_1 = require("../helpers/lockBody");
var Modal = /** @class */ (function () {
    function Modal(modalElement, container) {
        var _this = this;
        if (container != null) {
            this.modal = new A11yDialog(modalElement, container);
        }
        else {
            this.modal = new A11yDialog(modalElement);
        }
        this.modalElement = modalElement;
        this.modal.on('show', function () {
            _this.bodyStyles = lockBody_1.lockBody();
        });
        this.modal.on('hide', function () {
            lockBody_1.unlockBody(_this.bodyStyles);
        });
    }
    return Modal;
}());
exports.Modal = Modal;
//# sourceMappingURL=a11y-modal.js.map