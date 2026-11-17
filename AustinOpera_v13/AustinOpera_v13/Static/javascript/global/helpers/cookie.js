"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireCookie = exports.setCookie = exports.getCookie = void 0;
function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}
exports.getCookie = getCookie;
function setCookie(name, value, days, domain) {
    if (domain === void 0) { domain = ''; }
    var d = new Date;
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    var newCookie = name + "=" + value + ";path=/;expires=" + d.toUTCString() + ";" + (domain ? ";domain=" + domain : '');
    document.cookie = newCookie;
}
exports.setCookie = setCookie;
function expireCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
}
exports.expireCookie = expireCookie;
//# sourceMappingURL=cookie.js.map