export function getCookie(name: string) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

export function setCookie(name: string, value: boolean | string, days: number, domain = '') {
    var d = new Date;
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    const newCookie = `${name}=${value};path=/;expires=${d.toUTCString()};` + (domain ? `;domain=${domain}` : '');
    document.cookie = newCookie;
}

export function expireCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}