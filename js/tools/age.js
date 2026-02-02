// js/tools/age.js

function showError(msg) {
    const el = document.getElementById('age-error-msg');
    if (el) {
        el.textContent = msg;
        el.classList.remove('d-none');
    } else {
        alert(msg);
    }
}

function calc(e) {
    e.preventDefault();
    const dobInput = document.getElementById('dob');
    const errorEl = document.getElementById('age-error-msg');
    
    if (errorEl) errorEl.classList.add('d-none'); // Reset error

    if (!dobInput) return;

    const dobVal = dobInput.value;
    
    if (!dobVal) {
        showError('Please select your Date of Birth.');
        return;
    }

    const dob = new Date(dobVal);
    const now = new Date();
    
    if (dob > now) {
        showError('Date of birth cannot be in the future.');
        return;
    }

    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    // Total days
    const diffTime = Math.abs(now - dob);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // Support both ID sets
    const resYears = document.getElementById('res-years') || document.getElementById('age-years');
    const resMonths = document.getElementById('res-months') || document.getElementById('age-months');
    const resDays = document.getElementById('res-days') || document.getElementById('age-days');
    const resTotal = document.getElementById('total-days') || document.getElementById('age-total-days');

    if (resYears) resYears.textContent = years;
    if (resMonths) resMonths.textContent = months;
    if (resDays) resDays.textContent = days;
    if (resTotal) resTotal.textContent = new Intl.NumberFormat().format(totalDays);
}

export function init() {
    console.log('Age Calculator Initializing...');
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        const form = document.getElementById('age-form');
        if (form) {
            // Remove old listeners to be safe (though module reload should handle it)
            form.onclick = null;
            form.onsubmit = calc;
        } else {
            console.error('Age Calculator Form Not Found');
        }
    }, 50);
}

export function cleanup() {
    const form = document.getElementById('age-form');
    if (form) {
        form.onsubmit = null;
    }
}
