// js/tools/glassmorphism-form.js

function handleLoginSubmit(e) {
    e.preventDefault();
    alert('Login form submitted (Demonstration only. No data stored).');
}

export function init() {
    const form = document.getElementById('glass-login-form');
    if (form) {
        form.addEventListener('submit', handleLoginSubmit);
    }
}

export function cleanup() {
    const form = document.getElementById('glass-login-form');
    if (form) {
        form.removeEventListener('submit', handleLoginSubmit);
    }
}