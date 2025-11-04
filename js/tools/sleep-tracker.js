// js/tools/sleep-tracker.js

// --- DOM Elements ---
let bedtimeInput, wakeInput, logSleepBtn, sleepErrorMessage;
let todayDateDisplay, todaySleepDurationEl, todaySleepTimesEl;
let averageSleepDurationEl;
let sleepHistoryList, noSleepEntriesMessage;
let clearSleepDataBtn;

// --- State & Storage ---
const STORAGE_KEY = "sleepTrackerData";
let state = {
  entries: [], // [{ date: 'YYYY-MM-DD', bedtime: 'HH:MM', wakeTime: 'HH:MM', durationMinutes: N }]
};

// --- Helper Functions ---

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function parseTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

function calculateDuration(bedtimeStr, wakeTimeStr) {
  const today = new Date();
  const bedtime = new Date(today.toDateString() + " " + bedtimeStr);
  let wakeTime = new Date(today.toDateString() + " " + wakeTimeStr);

  // If wake time is earlier than bedtime, assume wake time is next day
  if (wakeTime.getTime() < bedtime.getTime()) {
    wakeTime.setDate(wakeTime.getDate() + 1);
  }

  const diffMs = wakeTime.getTime() - bedtime.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  return diffMinutes;
}

function formatDuration(totalMinutes) {
  if (totalMinutes < 0) return "Invalid";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

// --- Local Storage Functions ---

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
}

function loadData() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    state.entries = JSON.parse(storedData);
  } else {
    state.entries = [];
  }
}

// --- UI Update Function ---

function updateUI() {
  const todayDate = getTodayDateString();
  const todayEntry = state.entries.find((entry) => entry.date === todayDate);

  // Update Today's Sleep
  todayDateDisplay.textContent = new Date(todayDate).toLocaleDateString();
  if (todayEntry) {
    todaySleepDurationEl.textContent = formatDuration(
      todayEntry.durationMinutes
    );
    todaySleepTimesEl.textContent = `Logged: ${todayEntry.bedtime} - ${todayEntry.wakeTime}`;
  } else {
    todaySleepDurationEl.textContent = "0h 0m";
    todaySleepTimesEl.textContent = "Not logged yet.";
  }

  // Update Sleep History
  sleepHistoryList.innerHTML = "";
  if (state.entries.length === 0) {
    noSleepEntriesMessage.classList.remove("d-none");
  } else {
    noSleepEntriesMessage.classList.add("d-none");
    // Sort by date descending
    const sortedEntries = [...state.entries].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    sortedEntries.forEach((entry) => {
      const listItem = document.createElement("div");
      listItem.className =
        "list-group-item d-flex justify-content-between align-items-center";
      listItem.innerHTML = `
                <div>
                    <strong>${new Date(
                      entry.date
                    ).toLocaleDateString()}</strong><br>
                    <small>${entry.bedtime} - ${entry.wakeTime}</small>
                </div>
                <span class="badge bg-primary rounded-pill">${formatDuration(
                  entry.durationMinutes
                )}</span>
            `;
      sleepHistoryList.appendChild(listItem);
    });
  }

  // Calculate and Update 7-Day Average Sleep
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentEntries = state.entries.filter(
    (entry) => new Date(entry.date) >= sevenDaysAgo
  );

  let totalRecentMinutes = 0;
  recentEntries.forEach((entry) => {
    totalRecentMinutes += entry.durationMinutes;
  });

  const averageMinutes =
    recentEntries.length > 0 ? totalRecentMinutes / recentEntries.length : 0;
  averageSleepDurationEl.textContent = formatDuration(
    Math.round(averageMinutes)
  );
}

// --- Event Handlers ---

function handleLogSleep() {
  const bedtime = bedtimeInput.value;
  const wakeTime = wakeInput.value;

  if (!bedtime || !wakeTime) {
    sleepErrorMessage.textContent =
      "Please enter both bedtime and wake up time.";
    sleepErrorMessage.classList.remove("d-none");
    return;
  }

  const duration = calculateDuration(bedtime, wakeTime);

  if (duration <= 0) {
    sleepErrorMessage.textContent = "Wake up time must be after bedtime.";
    sleepErrorMessage.classList.remove("d-none");
    return;
  }

  sleepErrorMessage.classList.add("d-none"); // Hide error if valid

  const todayDate = getTodayDateString();
  const existingIndex = state.entries.findIndex(
    (entry) => entry.date === todayDate
  );

  const newEntry = {
    date: todayDate,
    bedtime: bedtime,
    wakeTime: wakeTime,
    durationMinutes: duration,
  };

  if (existingIndex !== -1) {
    state.entries[existingIndex] = newEntry; // Update existing entry for today
  } else {
    state.entries.push(newEntry); // Add new entry
  }

  saveData();
  updateUI();
}

function handleClearAllData() {
  if (
    confirm(
      "Are you sure you want to clear all sleep tracking data? This cannot be undone."
    )
  ) {
    state.entries = [];
    saveData();
    updateUI();
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  bedtimeInput = document.getElementById("sleep-bedtime-input");
  wakeInput = document.getElementById("sleep-wake-input");
  logSleepBtn = document.getElementById("log-sleep-btn");
  sleepErrorMessage = document.getElementById("sleep-error-message");

  todayDateDisplay = document.getElementById("today-date-display");
  todaySleepDurationEl = document.getElementById("today-sleep-duration");
  todaySleepTimesEl = document.getElementById("today-sleep-times");
  averageSleepDurationEl = document.getElementById("average-sleep-duration");

  sleepHistoryList = document.getElementById("sleep-history-list");
  noSleepEntriesMessage = document.getElementById("no-sleep-entries");
  clearSleepDataBtn = document.getElementById("clear-sleep-data-btn");

  // Load data and render initial UI
  loadData();
  updateUI();

  // Attach event listeners
  logSleepBtn.addEventListener("click", handleLogSleep);
  clearSleepDataBtn.addEventListener("click", handleClearAllData);
}

export function cleanup() {
  // Remove event listeners to prevent memory leaks
  logSleepBtn.removeEventListener("click", handleLogSleep);
  clearSleepDataBtn.removeEventListener("click", handleClearAllData);
}
