// js/tools/age.js
export function init() {
  const form = document.getElementById("age-form");
  if (form) form.addEventListener("submit", handleSubmit);
}

export function cleanup() {
  const form = document.getElementById("age-form");
  if (form) form.removeEventListener("submit", handleSubmit);
}

function handleSubmit(e) {
  e.preventDefault();
  const dobInput = document.getElementById("dob");
  const resultContainer = document.getElementById("age-result-container");
  const yearsEl = document.getElementById("age-years");
  const monthsEl = document.getElementById("age-months");
  const daysEl = document.getElementById("age-days");
  const errorEl = document.getElementById("age-error");

  resultContainer.classList.remove("d-none"); // Show the results area
  errorEl.textContent = ""; // Clear previous errors

  if (!dobInput.value) {
    errorEl.textContent = "Please select your birth date.";
    yearsEl.textContent = "--";
    monthsEl.textContent = "--";
    daysEl.textContent = "--";
    return;
  }

  const birthDate = new Date(dobInput.value);
  const today = new Date();

  if (birthDate > today) {
    errorEl.textContent = "You entered a future date!";
    return;
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Update the new result boxes
  yearsEl.textContent = years;
  monthsEl.textContent = months;
  daysEl.textContent = days;
}
