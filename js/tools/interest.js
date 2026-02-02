// js/tools/interest.js

let form, principal, rate, time, freq;
let futureVal, totalInt, summaryPrin;

function calculate(e) {
    e.preventDefault();
    const P = parseFloat(principal.value);
    const r = parseFloat(rate.value) / 100;
    const t = parseFloat(time.value);
    const n = parseFloat(freq.value);

    if (isNaN(P) || isNaN(r) || isNaN(t)) return;

    const A = P * Math.pow(1 + (r / n), n * t);
    const I = A - P;

    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    futureVal.textContent = fmt.format(A);
    summaryPrin.textContent = fmt.format(P);
    totalInt.textContent = fmt.format(I);
}

export function init() {
    form = document.getElementById('interest-form');
    principal = document.getElementById('principal');
    rate = document.getElementById('rate');
    time = document.getElementById('time');
    freq = document.getElementById('compounding-frequency');
    
    futureVal = document.getElementById('future-value');
    totalInt = document.getElementById('total-interest');
    summaryPrin = document.getElementById('summary-principal');

    form.addEventListener('submit', calculate);
    calculate({ preventDefault: () => {} });
}

export function cleanup() {}
