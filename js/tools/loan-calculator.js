// js/tools/loan-calculator.js

let form, amountInput, rateInput, termInput;
let monthlyPaymentEl, totalPrincipalEl, totalInterestEl, totalPaymentEl, amortizationTbody;

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function calculate(e) {
    e.preventDefault();
    const P = parseFloat(amountInput.value);
    const annualRate = parseFloat(rateInput.value);
    const years = parseFloat(termInput.value);

    if (isNaN(P) || isNaN(annualRate) || isNaN(years) || P <= 0) return;

    const monthlyRate = annualRate / 100 / 12;
    const n = years * 12;

    let monthlyPayment = 0;
    if (monthlyRate === 0) {
        monthlyPayment = P / n;
    } else {
        monthlyPayment = (P * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    monthlyPaymentEl.textContent = formatCurrency(monthlyPayment);
    totalPrincipalEl.textContent = formatCurrency(P);
    totalInterestEl.textContent = formatCurrency(totalInterest);
    totalPaymentEl.textContent = formatCurrency(totalPayment);

    renderSchedule(P, monthlyRate, n, monthlyPayment);
}

function renderSchedule(principal, monthlyRate, months, payment) {
    let balance = principal;
    let html = '';

    for (let i = 1; i <= months; i++) {
        const interest = balance * monthlyRate;
        const principalPaid = payment - interest;
        balance -= principalPaid;
        if (balance < 0) balance = 0;

        html += `
            <tr>
                <td class="text-secondary">${i}</td>
                <td class="text-end text-white">${formatCurrency(payment)}</td>
                <td class="text-end text-success">${formatCurrency(principalPaid)}</td>
                <td class="text-end text-danger">${formatCurrency(interest)}</td>
                <td class="text-end text-white-50">${formatCurrency(balance)}</td>
            </tr>
        `;
    }
    amortizationTbody.innerHTML = html;
}

export function init() {
    form = document.getElementById('loan-form');
    amountInput = document.getElementById('loan-amount');
    rateInput = document.getElementById('interest-rate');
    termInput = document.getElementById('loan-term');
    monthlyPaymentEl = document.getElementById('monthly-payment');
    totalPrincipalEl = document.getElementById('total-principal');
    totalInterestEl = document.getElementById('total-interest');
    totalPaymentEl = document.getElementById('total-payment');
    amortizationTbody = document.getElementById('amortization-tbody');

    form.addEventListener('submit', calculate);
    calculate({ preventDefault: () => {} });
}

export function cleanup() {}