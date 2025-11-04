// js/tools/date-difference.js
export function init() {
  const form = document.getElementById("date-diff-form");
  if (form) form.addEventListener("submit", handleSubmit);
}

export function cleanup() {
  const form = document.getElementById("date-diff-form");
  if (form) form.removeEventListener("submit", handleSubmit);
}

function handleSubmit(e) {
  e.preventDefault();
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");
  const resultContainer = document.getElementById("date-diff-result-container");
  const yearsEl = document.getElementById("date-diff-years");
  const monthsEl = document.getElementById("date-diff-months");
  const daysEl = document.getElementById("date-diff-days");
  const errorEl = document.getElementById("date-diff-error");

  resultContainer.classList.remove("d-none"); // Show the results area
  errorEl.textContent = ""; // Clear previous errors

  const resetResults = () => {
    yearsEl.textContent = "--";
    monthsEl.textContent = "--";
    daysEl.textContent = "--";
  };

  if (!startDateInput.value || !endDateInput.value) {
    errorEl.textContent = "Please select both a start and end date.";
    resetResults();
    return;
  }

  let date1 = new Date(startDateInput.value);
  let date2 = new Date(endDateInput.value);

  // Ensure date1 is the earlier date
  if (date1 > date2) {
    [date1, date2] = [date2, date1]; // Swap dates
  }

  let years = date2.getFullYear() - date1.getFullYear();
  let months = date2.getMonth() - date1.getMonth();
  let days = date2.getDate() - date1.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    // Get the last day of the previous month for date2
    const lastDayOfPrevMonth = new Date(
      date2.getFullYear(),
      date2.getMonth(),
      0
    ).getDate();
    days += lastDayOfPrevMonth;
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  yearsEl.textContent = years;
  monthsEl.textContent = months;
  daysEl.textContent = days;
}
