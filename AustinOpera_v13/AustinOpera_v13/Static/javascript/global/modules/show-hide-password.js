"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showHidePassword = void 0;
var showHidePassword = function () {
    var passwordToggles = [].slice.call(document.querySelectorAll('[data-password-input]'));
    passwordToggles.forEach(function (toggleContainer) {
        var passwordToggle = toggleContainer.querySelector('button');
        var passwordInput = toggleContainer.querySelector('input[type="password"]');
        if (passwordToggle && passwordInput) {
            var showText_1 = passwordToggle.getAttribute('data-password-input-show');
            var hideText_1 = passwordToggle.getAttribute('data-password-input-hide');
            var checked_1 = false;
            passwordToggle.addEventListener('click', function () {
                if (!checked_1) {
                    passwordInput.type = 'text';
                    passwordToggle.setAttribute('aria-label', hideText_1);
                    passwordToggle.setAttribute('aria-pressed', 'true');
                }
                else {
                    passwordInput.type = 'password';
                    passwordToggle.setAttribute('aria-label', showText_1);
                    passwordToggle.setAttribute('aria-pressed', 'false');
                }
                checked_1 = !checked_1;
            });
        }
    });
};
exports.showHidePassword = showHidePassword;
//# sourceMappingURL=show-hide-password.js.map