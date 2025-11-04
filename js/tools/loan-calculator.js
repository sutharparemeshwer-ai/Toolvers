// js/tools/loan-calculator.js

let form, amountInput, rateInput, termInput;
let monthlyPaymentEl,
  totalPrincipalEl,
  totalInterestEl,
  totalPaymentEl,
  amortizationTbody;
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function calculateLoan(e) {
  e.preventDefault();

  const P = parseFloat(amountInput.value);
  const annualRate = parseFloat(rateInput.value);
  const years = parseFloat(termInput.value);

  if (
    isNaN(P) ||
    isNaN(annualRate) ||
    isNaN(years) ||
    P <= 0 ||
    annualRate < 0 ||
    years <= 0
  ) {
    alert("Please enter valid positive numbers for all fields.");
    return;
  }

  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12; // Total number of payments

  let monthlyPayment;
  if (monthlyRate === 0) {
    // Handle zero interest rate
    monthlyPayment = P / n;
  } else {
    monthlyPayment =
      (P * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
      (Math.pow(1 + monthlyRate, n) - 1);
  }

  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - P;

  // Display results
  monthlyPaymentEl.textContent = formatCurrency(monthlyPayment);
  totalPrincipalEl.textContent = formatCurrency(P);
  totalInterestEl.textContent = formatCurrency(totalInterest);
  totalPaymentEl.textContent = formatCurrency(totalPayment);

  generateAmortizationSchedule(P, monthlyRate, n, monthlyPayment);
}

function generateAmortizationSchedule(
  principal,
  monthlyRate,
  numberOfPayments,
  monthlyPayment
) {
  amortizationTbody.innerHTML = ""; // Clear previous schedule
  let remainingBalance = principal;

  for (let i = 1; i <= numberOfPayments; i++) {
    const interestForMonth = remainingBalance * monthlyRate;
    const principalForMonth = monthlyPayment - interestForMonth;
    remainingBalance -= principalForMonth;

    // To prevent negative balance at the end due to rounding
    if (remainingBalance < 0) remainingBalance = 0;

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${i}</td>
            <td>${formatCurrency(monthlyPayment)}</td>
            <td>${formatCurrency(principalForMonth)}</td>
            <td>${formatCurrency(interestForMonth)}</td>
            <td>${formatCurrency(remainingBalance)}</td>
        `;
    amortizationTbody.appendChild(row);
  }
}

export function init() {
  form = document.getElementById("loan-form");
  amountInput = document.getElementById("loan-amount");
  rateInput = document.getElementById("interest-rate");
  termInput = document.getElementById("loan-term");
  monthlyPaymentEl = document.getElementById("monthly-payment");
  totalPrincipalEl = document.getElementById("total-principal");
  totalInterestEl = document.getElementById("total-interest");
  totalPaymentEl = document.getElementById("total-payment");
  amortizationTbody = document.getElementById("amortization-tbody");

  form.addEventListener("submit", calculateLoan);

  // Initial calculation on load
  calculateLoan(new Event("submit"));
}

export function cleanup() {
  form?.removeEventListener("submit", calculateLoan);
}
