// js/tools/compound-interest.js

let interestForm;
let principalInput, rateInput, timeInput, frequencyInput;
let futureValueOutput, totalInterestOutput;

function calculateInterest(P, r, t, n) {
    // A = P * (1 + r/n)^(n*t)
    
    // Convert rate percentage to decimal (e.g., 5% -> 0.05)
    const decimalRate = r / 100;
    
    // Calculate the power component: (1 + r/n)^(n*t)
    const exponent = n * t;
    const base = 1 + (decimalRate / n);
    
    const futureValue = P * Math.pow(base, exponent);
    
    return futureValue;
}

function handleSubmit(e) {
    e.preventDefault();

    // 1. Get and parse input values
    const P = parseFloat(principalInput.value);
    const r = parseFloat(rateInput.value);
    const t = parseFloat(timeInput.value);
    const n = parseInt(frequencyInput.value);

    // 2. Validate inputs
    if (isNaN(P) || isNaN(r) || isNaN(t) || isNaN(n) || P < 0 || r < 0 || t <= 0) {
        futureValueOutput.textContent = "Invalid Input";
        totalInterestOutput.textContent = "Please enter valid numbers.";
        return;
    }

    // 3. Perform calculation
    const A = calculateInterest(P, r, t, n);
    const I = A - P;

    // 4. Format and display results
    const currencyFormatter = new Intl.NumberFormat('en-IN', { // Using Indian format as a standard example
        style: 'currency',
        currency: 'INR', // You can change this to 'USD' or another currency if preferred
        minimumFractionDigits: 2,
    });

    futureValueOutput.textContent = currencyFormatter.format(A);
    totalInterestOutput.textContent = currencyFormatter.format(I);
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    interestForm = document.getElementById('interest-form');
    principalInput = document.getElementById('principal');
    rateInput = document.getElementById('rate');
    timeInput = document.getElementById('time');
    frequencyInput = document.getElementById('compounding-frequency');
    
    futureValueOutput = document.getElementById('future-value');
    totalInterestOutput = document.getElementById('total-interest');

    // 2. Attach listener
    if (interestForm) {
        interestForm.addEventListener('submit', handleSubmit);
    }
    
    // 3. Calculate initial value on load
    if (interestForm) {
        // Manually trigger submission to show default values
        interestForm.dispatchEvent(new Event('submit'));
    }
}

export function cleanup() {
    // Remove listener
    if (interestForm) {
        interestForm.removeEventListener('submit', handleSubmit);
    }
    
    // Reset output
    if (futureValueOutput) futureValueOutput.textContent = "--";
    if (totalInterestOutput) totalInterestOutput.textContent = "--";
}