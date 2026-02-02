// js/tools/tip-calculator.js

let billInput, customTipInput, peopleInput, btns;
let currentTip = 10;

function calc() {
    const bill = parseFloat(billInput.value) || 0;
    const people = parseInt(peopleInput.value) || 1;
    let tipPct = currentTip;
    
    if (customTipInput.value) {
        tipPct = parseFloat(customTipInput.value);
        btns.forEach(b => b.classList.remove('active'));
    }

    const tipAmt = bill * (tipPct / 100);
    const total = bill + tipAmt;
    const perPerson = total / people;

    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    document.getElementById('res-per-person').textContent = fmt.format(perPerson);
    document.getElementById('res-tip-total').textContent = fmt.format(tipAmt);
    document.getElementById('res-total').textContent = fmt.format(total);
}

function setTip(e) {
    customTipInput.value = '';
    btns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentTip = parseFloat(e.target.dataset.tip);
    calc();
}

export function init() {
    billInput = document.getElementById('bill-amount');
    customTipInput = document.getElementById('custom-tip');
    peopleInput = document.getElementById('people-count');
    btns = document.querySelectorAll('.tip-btn');

    billInput.addEventListener('input', calc);
    customTipInput.addEventListener('input', calc);
    peopleInput.addEventListener('input', calc);
    
    btns.forEach(b => b.addEventListener('click', setTip));

    document.getElementById('inc-people').addEventListener('click', () => {
        peopleInput.value = parseInt(peopleInput.value) + 1;
        calc();
    });
    document.getElementById('dec-people').addEventListener('click', () => {
        if(peopleInput.value > 1) {
            peopleInput.value = parseInt(peopleInput.value) - 1;
            calc();
        }
    });
}

export function cleanup() {}
