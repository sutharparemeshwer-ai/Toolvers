// js/tools/bmi.js

function calc(e) {
    e.preventDefault();
    let w = parseFloat(document.getElementById('weight').value);
    const wUnit = document.getElementById('weight-unit').value;
    let h = parseFloat(document.getElementById('height').value);
    const hUnit = document.getElementById('height-unit').value;

    if (!w || !h) return;

    if (wUnit === 'lbs') w *= 0.453592;
    if (hUnit === 'cm') h /= 100;
    if (hUnit === 'ft') h *= 0.3048;

    const bmi = w / (h * h);
    const val = bmi.toFixed(1);

    document.getElementById('bmi-result').textContent = val;
    
    let status = '', color = '';
    if (bmi < 18.5) { status = 'Underweight'; color = 'text-info'; }
    else if (bmi < 25) { status = 'Normal'; color = 'text-success'; }
    else if (bmi < 30) { status = 'Overweight'; color = 'text-warning'; }
    else { status = 'Obese'; color = 'text-danger'; }

    const badge = document.getElementById('bmi-status');
    badge.textContent = status;
    badge.className = `badge bg-dark border border-white-10 px-3 py-2 rounded-pill ${color}`;
}

export function init() {
    document.getElementById('bmi-form').addEventListener('submit', calc);
}
export function cleanup() {}