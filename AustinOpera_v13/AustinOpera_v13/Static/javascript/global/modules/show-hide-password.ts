export const showHidePassword = () => {
    const passwordToggles = [].slice.call(document.querySelectorAll('[data-password-input]'));
    passwordToggles.forEach(toggleContainer => {
        const passwordToggle = toggleContainer.querySelector('button') as HTMLButtonElement;
        const passwordInput = toggleContainer.querySelector('input[type="password"]') as HTMLInputElement;

        if (passwordToggle && passwordInput) {
            const showText = passwordToggle.getAttribute('data-password-input-show');
            const hideText = passwordToggle.getAttribute('data-password-input-hide');
            let checked = false;

            passwordToggle.addEventListener('click', () => {
                if (!checked) {
                    passwordInput.type = 'text';
                    passwordToggle.setAttribute('aria-label', hideText);
                    passwordToggle.setAttribute('aria-pressed', 'true');
                }
                else {
                    passwordInput.type = 'password';
                    passwordToggle.setAttribute('aria-label', showText);
                    passwordToggle.setAttribute('aria-pressed', 'false');
                }
                checked = !checked;
            });
        }
    });
}