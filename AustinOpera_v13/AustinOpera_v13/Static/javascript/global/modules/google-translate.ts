import { expireCookie, setCookie } from "../helpers/cookie";

const cookieName = 'googtrans22';

export function googleTranslateInit() {


    const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(cookieName))
        ?.split('=')[1].split("/");

    console.log('cookie value = ');
    console.log(cookieValue);

    if (cookieValue) {
        let splitValue = cookieValue[cookieValue.length - 1]
        const select = document.querySelector('[data-translate-select]') as HTMLInputElement;
        const items = document.querySelectorAll('[data-translate-select] option');
        items.forEach((item: HTMLInputElement) => {
            if (item.value == splitValue) {
                select.value = item.value
            }
        })
    }

    function onLanguageChange(e) {
        
        const select = e.target as HTMLSelectElement;
        const selectedLanguage = select?.value || 'en';

        if (selectedLanguage === 'en') {
            expireCookie(cookieName);
        } else {
            setCookie(cookieName, `/en/${selectedLanguage}`, .5);
        }

        location.reload();
    }

    const translateSelect = document.querySelector('[data-translate-select]');
    if (translateSelect) {
        translateSelect.addEventListener('change', onLanguageChange);
    }
}