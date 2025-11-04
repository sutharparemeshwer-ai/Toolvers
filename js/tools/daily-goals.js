// js/tools/daily-goals-tracker-app.js

// DOM Elements
let newGoalInputEl, addGoalBtnEl, goalsListEl, completedCountEl, clearAllBtnEl, emptyMessageEl;

// Array to hold our goals (the main application state)
let goals = [];
const STORAGE_KEY = 'dailyGoalsTrackerData';

// --- Local Storage Functions ---

/**
 * Loads goals from Local Storage.
 */
function loadGoals() {
    const storedGoals = localStorage.getItem(STORAGE_KEY);
    if (storedGoals) {
        goals = JSON.parse(storedGoals);
    }
}

/**
 * Saves current goals state to Local Storage.
 */
function saveGoals() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

// --- Rendering and UI Updates ---

/**
 * Renders the list of goals to the DOM.
 */
function renderGoals() {
    goalsListEl.innerHTML = ''; // Clear existing list
    
    if (goals.length === 0) {
        emptyMessageEl.classList.remove('d-none');
        completedCountEl.textContent = '0';
        return;
    } else {
        emptyMessageEl.classList.add('d-none');
    }

    let completedCount = 0;

    goals.forEach((goal, index) => {
        // Create the list item element
        const listItem = document.createElement('div');
        listItem.className = `list-group-item d-flex justify-content-between align-items-center ${goal.completed ? 'list-group-item-success' : ''}`;
        listItem.dataset.index = index; // Use data attribute to track index

        // Goal text with checkbox
        const textWrapper = document.createElement('div');
        textWrapper.className = 'd-flex align-items-center';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input me-3';
        checkbox.checked = goal.completed;
        checkbox.addEventListener('change', () => toggleGoal(index));

        const textSpan = document.createElement('span');
        textSpan.textContent = goal.text;
        if (goal.completed) {
            textSpan.style.textDecoration = 'line-through';
            completedCount++;
        }

        textWrapper.appendChild(checkbox);
        textWrapper.appendChild(textSpan);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteGoal(index));

        listItem.appendChild(textWrapper);
        listItem.appendChild(deleteBtn);
        goalsListEl.appendChild(listItem);
    });

    // Update the completed count display
    completedCountEl.textContent = completedCount;
}

// --- Goal Management Logic ---

/**
 * Adds a new goal to the list.
 */
function addGoal() {
    const text = newGoalInputEl.value.trim();
    if (text === '') return;

    const newGoal = {
        id: Date.now(), // Unique ID
        text: text,
        completed: false
    };

    goals.push(newGoal);
    newGoalInputEl.value = ''; // Clear input field
    
    saveGoals();
    renderGoals();
}

/**
 * Toggles the completion status of a goal.
 */
function toggleGoal(index) {
    goals[index].completed = !goals[index].completed;
    saveGoals();
    renderGoals();
}

/**
 * Deletes a goal by its index.
 */
function deleteGoal(index) {
    goals.splice(index, 1);
    saveGoals();
    renderGoals();
}

/**
 * Clears all goals from the list and storage.
 */
function clearAllGoals() {
    if (confirm("Are you sure you want to clear all goals?")) {
        goals = [];
        saveGoals();
        renderGoals();
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    newGoalInputEl = document.getElementById('new-goal-input');
    addGoalBtnEl = document.getElementById('add-goal-btn');
    goalsListEl = document.getElementById('goals-list');
    completedCountEl = document.getElementById('completed-count');
    clearAllBtnEl = document.getElementById('clear-all-btn');
    emptyMessageEl = document.getElementById('empty-message');

    // 2. Load existing goals and render
    loadGoals();
    renderGoals();
    
    // 3. Attach listeners
    if (addGoalBtnEl) {
        addGoalBtnEl.addEventListener('click', addGoal);
    }
    if (newGoalInputEl) {
        // Add goal when Enter key is pressed
        newGoalInputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addGoal();
            }
        });
    }
    if (clearAllBtnEl) {
        clearAllBtnEl.addEventListener('click', clearAllGoals);
    }
}

export function cleanup() {
    // Remove listeners
    if (addGoalBtnEl) {
        addGoalBtnEl.removeEventListener('click', addGoal);
    }
    if (newGoalInputEl) {
        newGoalInputEl.removeEventListener('keypress', addGoal);
    }
    if (clearAllBtnEl) {
        clearAllBtnEl.removeEventListener('click', clearAllGoals);
    }
    // Note: Local Storage data persists, but the goals array is reset on next init()
}