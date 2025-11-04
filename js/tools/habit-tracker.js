// js/tools/habit-tracker-app.js

// DOM Elements
let newHabitInputEl, addHabitBtnEl, habitsListEl, clearAllBtnEl, emptyMessageEl, dayLabelsContainerEl;

// Array to hold our habits (the main application state)
let habits = [];
const STORAGE_KEY = 'habitTrackerData';
const DAYS_TO_SHOW = 7;

// --- Helper Functions ---

/**
 * Gets the date string for today (YYYY-MM-DD).
 */
function getDateString(date) {
    const d = date ? new Date(date) : new Date();
    return d.toISOString().split('T')[0];
}

/**
 * Generates an array of the last N dates and their short day names.
 */
function getLastNDays(n) {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        days.push({
            dateString: getDateString(d),
            // Short day name (e.g., 'M', 'Tu', 'W')
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2)
        });
    }
    return days;
}

// --- Local Storage Functions ---

/**
 * Loads habits from Local Storage.
 */
function loadHabits() {
    const storedHabits = localStorage.getItem(STORAGE_KEY);
    if (storedHabits) {
        habits = JSON.parse(storedHabits);
    }
}

/**
 * Saves current habits state to Local Storage.
 */
function saveHabits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// --- Rendering and UI Updates ---

/**
 * Renders the day labels (M, Tu, W, etc.) once.
 */
function renderDayLabels() {
    dayLabelsContainerEl.innerHTML = '';
    const last7Days = getLastNDays(DAYS_TO_SHOW);
    
    last7Days.forEach(day => {
        const label = document.createElement('span');
        label.className = 'text-center small';
        label.style.width = `${100 / DAYS_TO_SHOW}%`;
        label.textContent = day.dayName;
        dayLabelsContainerEl.appendChild(label);
    });
}

/**
 * Renders the list of habits to the DOM.
 */
function renderHabits() {
    const last7Days = getLastNDays(DAYS_TO_SHOW);
    
    // Clear previous habit list, but keep the day labels container intact
    const habitItems = habitsListEl.querySelectorAll('.habit-item');
    habitItems.forEach(item => item.remove());

    if (habits.length === 0) {
        emptyMessageEl.classList.remove('d-none');
        return;
    } else {
        emptyMessageEl.classList.add('d-none');
    }

    habits.forEach((habit, habitIndex) => {
        const item = document.createElement('div');
        item.className = 'habit-item d-flex justify-content-between align-items-center mb-3 p-2 border rounded';
        
        // --- Habit Name and Delete Button ---
        const nameSection = document.createElement('div');
        nameSection.className = 'd-flex align-items-center me-3';
        nameSection.style.width = '30%';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = habit.name;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger ms-2 p-1';
        deleteBtn.innerHTML = '<i class="fa-solid fa-xmark" style="font-size: 0.8em;"></i>';
        deleteBtn.addEventListener('click', () => deleteHabit(habitIndex));

        nameSection.appendChild(nameSpan);
        nameSection.appendChild(deleteBtn);
        item.appendChild(nameSection);

        // --- Progress Grid ---
        const progressGrid = document.createElement('div');
        progressGrid.className = 'd-flex flex-grow-1';

        last7Days.forEach(day => {
            const dateStr = day.dateString;
            const status = habit.history[dateStr]; // true, false, or undefined
            
            const dayBox = document.createElement('div');
            dayBox.className = 'progress-box text-center border rounded mx-1';
            dayBox.style.width = `${100 / DAYS_TO_SHOW}%`;
            dayBox.style.height = '30px';
            dayBox.style.cursor = 'pointer';
            dayBox.dataset.date = dateStr;
            dayBox.dataset.habitIndex = habitIndex;

            // Apply color based on status
            if (status === true) {
                dayBox.classList.add('bg-success'); // Completed
                dayBox.innerHTML = '<i class="fa-solid fa-check text-white mt-1"></i>';
            } else if (status === false) {
                dayBox.classList.add('bg-danger'); // Missed/Skipped
                dayBox.innerHTML = '<i class="fa-solid fa-slash text-white mt-1"></i>';
            } else {
                dayBox.classList.add('bg-light'); // Pending/Unknown
            }

            // Click listener to toggle status
            dayBox.addEventListener('click', toggleDayStatus);
            progressGrid.appendChild(dayBox);
        });

        item.appendChild(progressGrid);
        habitsListEl.appendChild(item);
    });
}

// --- Habit Management Logic ---

/**
 * Adds a new habit to the list.
 */
function addHabit() {
    const name = newHabitInputEl.value.trim();
    if (name === '') return;

    const newHabit = {
        id: Date.now(),
        name: name,
        history: {} // History object stores status by date
    };

    habits.push(newHabit);
    newHabitInputEl.value = '';
    
    saveHabits();
    renderHabits();
}

/**
 * Toggles the status of a specific day for a specific habit.
 * Status cycles: undefined (Pending) -> true (Completed) -> false (Missed) -> undefined
 */
function toggleDayStatus(event) {
    const box = event.currentTarget;
    const dateStr = box.dataset.date;
    const habitIndex = parseInt(box.dataset.habitIndex);
    
    let currentStatus = habits[habitIndex].history[dateStr];
    let newStatus;

    if (currentStatus === undefined) {
        newStatus = true; // Pending -> Completed
    } else if (currentStatus === true) {
        newStatus = false; // Completed -> Missed
    } else {
        newStatus = undefined; // Missed -> Pending
        // Remove the property entirely to keep the data clean
        delete habits[habitIndex].history[dateStr]; 
    }
    
    if (newStatus !== undefined) {
        habits[habitIndex].history[dateStr] = newStatus;
    }

    saveHabits();
    renderHabits(); // Re-render the UI to reflect changes
}

/**
 * Deletes a habit by its index.
 */
function deleteHabit(index) {
    if (confirm(`Are you sure you want to stop tracking "${habits[index].name}"?`)) {
        habits.splice(index, 1);
        saveHabits();
        renderHabits();
    }
}

/**
 * Clears all habits from the list and storage.
 */
function clearAllHabits() {
    if (confirm("Are you sure you want to clear ALL tracked habits and history?")) {
        habits = [];
        saveHabits();
        renderHabits();
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    newHabitInputEl = document.getElementById('new-habit-input');
    addHabitBtnEl = document.getElementById('add-habit-btn');
    habitsListEl = document.getElementById('habits-list');
    clearAllBtnEl = document.getElementById('clear-all-btn');
    emptyMessageEl = document.getElementById('empty-message');
    dayLabelsContainerEl = document.getElementById('day-labels-container');


    // 2. Load and Render
    loadHabits();
    renderDayLabels(); // Render static day labels first
    renderHabits();
    
    // 3. Attach listeners
    if (addHabitBtnEl) {
        addHabitBtnEl.addEventListener('click', addHabit);
    }
    if (newHabitInputEl) {
        newHabitInputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addHabit();
            }
        });
    }
    if (clearAllBtnEl) {
        clearAllBtnEl.addEventListener('click', clearAllHabits);
    }
}

export function cleanup() {
    // Remove listeners
    if (addHabitBtnEl) {
        addHabitBtnEl.removeEventListener('click', addHabit);
    }
    if (newHabitInputEl) {
        newHabitInputEl.removeEventListener('keypress', addHabit);
    }
    if (clearAllBtnEl) {
        clearAllBtnEl.removeEventListener('click', clearAllHabits);
    }
    // No need to clear habits array as local storage persists
}