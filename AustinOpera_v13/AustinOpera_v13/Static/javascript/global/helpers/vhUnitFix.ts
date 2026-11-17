// This is solely because of iOS safari. It likes to change the innerHeight of the browser without updating the actual value of 1vh.
// So this is a way to fix the measurement of vh units when applied to specific things in css.
// https://css-tricks.com/the-trick-to-viewport-units-on-mobile/

// This version doesn't get updated on resize, so can be used for layouts that would jump
export function vhUnitInitial() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh-initial', `${vh}px`);
    // I'm dispatching this event because some browsers don't force a repaint when the css property changes, on load
    window.dispatchEvent(new Event('resize'));
}

// This version gets updated on resize (which happens on scroll in some mobile browsers) so the elements might jump
export function vhUnitUpdate() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}