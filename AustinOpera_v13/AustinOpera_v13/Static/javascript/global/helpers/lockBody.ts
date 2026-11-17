export function lockBody() {
    const bodyStyles = document.body.style.cssText;
    document.body.style.overflow = 'hidden';
    return bodyStyles;
}

export function unlockBody(oldStyles: string) {
    document.body.style.cssText = oldStyles || '';
}