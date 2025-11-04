// js/tools/theme-converter.js

let switchEl, containerEl;

function handleThemeToggle() {
    // The CSS will handle the visual change based on this class
    containerEl.classList.toggle('light-mode');
}

export function init() {
    switchEl = document.getElementById('theme-switch');
    containerEl = document.getElementById('theme-converter-container');

    if (switchEl && containerEl) {
        switchEl.addEventListener('change', handleThemeToggle);
    }
}

export function cleanup() {
    if (switchEl) {
        switchEl.removeEventListener('change', handleThemeToggle);
    }
}