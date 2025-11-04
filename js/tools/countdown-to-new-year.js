// js/tools/countdown-to-new-year.js

let yearEl, daysEl, hoursEl, minutesEl, secondsEl, messageEl;
let countdownInterval;

function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const newYearDate = new Date(`January 1, ${currentYear + 1} 00:00:00`);

    yearEl.textContent = currentYear + 1;

    const diff = newYearDate - now;

    if (diff <= 0) {
        daysEl.textContent = '0';
        hoursEl.textContent = '0';
        minutesEl.textContent = '0';
        secondsEl.textContent = '0';
        messageEl.classList.remove('d-none');
        clearInterval(countdownInterval);
        return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = d;
    hoursEl.textContent = h;
    minutesEl.textContent = m;
    secondsEl.textContent = s;
}

export function init() {
    yearEl = document.getElementById('ny-year');
    daysEl = document.getElementById('ny-days');
    hoursEl = document.getElementById('ny-hours');
    minutesEl = document.getElementById('ny-minutes');
    secondsEl = document.getElementById('ny-seconds');
    messageEl = document.getElementById('ny-message');

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

export function cleanup() {
    clearInterval(countdownInterval);
}