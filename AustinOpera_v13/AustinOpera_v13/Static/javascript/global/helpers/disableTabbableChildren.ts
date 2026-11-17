export function disableTabbableChildren(parent) {
    let tabbableChildren = [].slice.call(parent.querySelectorAll('a, button, input, select, textarea'));
    tabbableChildren.forEach(child => {
        child.tabIndex = -1;
    })
}