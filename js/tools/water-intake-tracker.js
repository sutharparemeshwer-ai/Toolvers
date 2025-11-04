// js/tools/water-intake-tracker.js

// --- DOM Elements ---
let goalInput, setGoalBtn, progressText, progressPercent, progressBar;
let quickAddContainer, manualAddInput, manualAddBtn, resetBtn;

// --- State & Storage ---
const STORAGE_KEY = "waterIntakeTrackerData";
let state = {
  goal: 2000,
  current: 0,
  date: new Date().toLocaleDateString(), // To reset data daily
};

// --- Local Storage Functions ---

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadData() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    const parsedData = JSON.parse(storedData);
    // If the stored data is not from today, reset it.
    if (parsedData.date === new Date().toLocaleDateString()) {
      state = parsedData;
    } else {
      // Keep the goal from the previous day, but reset the current amount
      state.goal = parsedData.goal || 2000;
      saveData(); // Save the reset state for the new day
    }
  }
}

// --- UI Update Function ---

function updateUI() {
  const percent =
    state.goal > 0 ? Math.min((state.current / state.goal) * 100, 100) : 0;

  goalInput.value = state.goal;
  progressText.textContent = `${state.current} / ${state.goal} ml`;
  progressPercent.textContent = `${Math.round(percent)}`;
  progressBar.style.width = `${percent}%`;
  progressBar.setAttribute("aria-valuenow", percent);

  // Add a class when the goal is reached for extra styling
  if (percent >= 100) {
    progressBar.classList.add("bg-success");
  } else {
    progressBar.classList.remove("bg-success");
  }
}

// --- Event Handlers ---

function handleSetGoal() {
  const newGoal = parseInt(goalInput.value, 10);
  if (newGoal && newGoal >= 500) {
    state.goal = newGoal;
    saveData();
    updateUI();
  } else {
    // Reset to a valid number if input is invalid
    goalInput.value = state.goal;
  }
}

function addWater(amount) {
  const newAmount = parseInt(amount, 10);
  if (!isNaN(newAmount) && newAmount > 0) {
    state.current += newAmount;
    saveData();
    updateUI();
  }
}

function handleQuickAdd(e) {
  if (e.target.matches("button[data-amount]")) {
    addWater(e.target.dataset.amount);
  }
}

function handleManualAdd() {
  addWater(manualAddInput.value);
  manualAddInput.value = ""; // Clear input after adding
}

function handleReset() {
  if (confirm("Are you sure you want to reset your progress for today?")) {
    state.current = 0;
    saveData();
    updateUI();
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  goalInput = document.getElementById("water-goal-input");
  setGoalBtn = document.getElementById("set-goal-btn");
  progressText = document.getElementById("water-progress-text");
  progressPercent = document.getElementById("water-progress-percent");
  progressBar = document.getElementById("water-progress-bar");
  quickAddContainer = document.getElementById("quick-add-buttons");
  manualAddInput = document.getElementById("manual-add-input");
  manualAddBtn = document.getElementById("manual-add-btn");
  resetBtn = document.getElementById("reset-water-btn");

  // Load data and render initial UI
  loadData();
  updateUI();

  // Attach event listeners
  setGoalBtn.addEventListener("click", handleSetGoal);
  quickAddContainer.addEventListener("click", handleQuickAdd);
  manualAddBtn.addEventListener("click", handleManualAdd);
  resetBtn.addEventListener("click", handleReset);
  manualAddInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleManualAdd();
  });
}

export function cleanup() {
  // Remove event listeners to prevent memory leaks
  setGoalBtn.removeEventListener("click", handleSetGoal);
  quickAddContainer.removeEventListener("click", handleQuickAdd);
  manualAddBtn.removeEventListener("click", handleManualAdd);
  resetBtn.removeEventListener("click", handleReset);
}
