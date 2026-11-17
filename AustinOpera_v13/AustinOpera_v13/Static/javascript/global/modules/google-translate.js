"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleTranslateInit = void 0;
var cookie_1 = require("../helpers/cookie");
var cookieName = 'googtrans22';
function googleTranslateInit() {
    var _a;
    var cookieValue = (_a = document.cookie
        .split('; ')
        .find(function (row) { return row.startsWith(cookieName); })) === null || _a === void 0 ? void 0 : _a.split('=')[1].split("/");
    console.log('cookie value = ');
    console.log(cookieValue);
    if (cookieValue) {
        var splitValue_1 = cookieValue[cookieValue.length - 1];
        var select_1 = document.querySelector('[data-translate-select]');
        var items = document.querySelectorAll('[data-translate-select] option');
        items.forEach(function (item) {
            if (item.value == splitValue_1) {
                select_1.value = item.value;
            }
        });
    }
    function onLanguageChange(e) {
        var select = e.target;
        var selectedLanguage = (select === null || select === void 0 ? void 0 : select.value) || 'en';
        if (selectedLanguage === 'en') {
            cookie_1.expireCookie(cookieName);
        }
        else {
            cookie_1.setCookie(cookieName, "/en/" + selectedLanguage, .5);
        }
        location.reload();
    }
    var translateSelect = document.querySelector('[data-translate-select]');
    if (translateSelect) {
        translateSelect.addEventListener('change', onLanguageChange);
    }
}
exports.googleTranslateInit = googleTranslateInit;
//# sourceMappingURL=google-translate.js.map