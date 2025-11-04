// js/tools/bmi.js (Updated onSubmit function)

function onSubmit(e) {
  e.preventDefault();
  const w = parseFloat(document.getElementById('weight').value) || 0;
  const h = parseFloat(document.getElementById('height').value) || 0;
  const resultEl = document.getElementById('bmi-result');
  const statusEl = document.getElementById('bmi-status');

  if (!w || !h) {
    resultEl.textContent = '—';
    statusEl.className = 'alert alert-warning mt-3';
    statusEl.textContent = 'Please enter valid weight (kg) and height (m).';
    return;
  }
  
  // Calculate BMI
  const bmi = (w / (h * h)).toFixed(2);
  resultEl.textContent = bmi;
  
  let classification = '';
  let alertClass = '';

  // WHO BMI Classification
  if (bmi < 18.5) {
    classification = 'Underweight';
    alertClass = 'alert-warning';
  } else if (bmi >= 18.5 && bmi < 24.9) {
    classification = 'Normal Weight (Healthy)';
    alertClass = 'alert-success';
  } else if (bmi >= 25 && bmi < 29.9) {
    classification = 'Overweight';
    alertClass = 'alert-danger';
  } else {
    classification = 'Obesity';
    alertClass = 'alert-dark';
  }
  
  // Update the status element with classification and color-coding
  statusEl.className = `alert ${alertClass} mt-3`;
  statusEl.textContent = `Status: ${classification}`;
}

// Your init and cleanup functions remain the same
export async function init() {
  const form = document.getElementById('bmi-form');
  if (!form) return;
  form.addEventListener('submit', onSubmit);
  const w = document.getElementById('weight');
  if (w) w.focus();
}

export async function cleanup() {
  const form = document.getElementById('bmi-form');
  if (form) form.removeEventListener('submit', onSubmit);
}