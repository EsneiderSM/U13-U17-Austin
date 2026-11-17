export function getHeightOfHidden(element) {
    const el = element as HTMLElement;
    const parentStyles = el.parentElement.getAttribute('style');
    const selfStyles = el.getAttribute('style');
    el.parentElement.setAttribute('style', 'position: relative !important; width: 100% !important;');
    el.setAttribute('style', 'opacity: 0 !important; height: auto !important; position: absolute !important;');

    const elementHeight = element.offsetHeight;
    if (selfStyles) {
        el.setAttribute('style', selfStyles);
    }
    else {
        el.removeAttribute('style');
    }
    if (parentStyles) {
        el.parentElement.setAttribute('style', parentStyles);
    }
    else {
        el.parentElement.removeAttribute('style');
    }
    return elementHeight;
}