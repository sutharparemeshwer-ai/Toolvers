// js/tools/date-difference.js

function calc(e) {
    if(e) e.preventDefault();
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');
    
    if(!startInput.value || !endInput.value) return;

    const d1 = new Date(startInput.value);
    const d2 = new Date(endInput.value);
    
    // Swap if d1 > d2
    const start = d1 < d2 ? d1 : d2;
    const end = d1 < d2 ? d2 : d1;

    // Years/Months/Days logic
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
        months--;
        days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    // Totals
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = (totalDays / 7).toFixed(1);

    document.getElementById('res-years').textContent = years;
    document.getElementById('res-months').textContent = months;
    document.getElementById('res-days').textContent = days;
    
    document.getElementById('total-days').textContent = totalDays.toLocaleString();
    document.getElementById('total-weeks').textContent = totalWeeks;
    
    document.getElementById('results-grid').classList.remove('d-none');
}

export function init() {
    const form = document.getElementById('date-diff-form');
    if(form) form.addEventListener('submit', calc);
}

export function cleanup() {
    //
}