// js/tools/todo-list.js

const STORAGE_KEY = 'todoListTasks';

// The main array to hold all tasks
let tasks = [];

// DOM Elements
let taskListEl, newTaskInputEl, addTaskBtnEl, clearAllBtnEl;

// --- Local Storage Functions ---

/**
 * Loads tasks from localStorage or returns an empty array.
 */
function loadTasks() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
}

/**
 * Saves the current tasks array to localStorage.
 */
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --- DOM Rendering Functions ---

/**
 * Renders the entire tasks array to the DOM.
 */
function renderTasks() {
    taskListEl.innerHTML = ''; // Clear existing list content

    if (tasks.length === 0) {
        taskListEl.innerHTML = `<p class="text-muted text-center small">Your list is empty. Add a task!</p>`;
        return;
    }

    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center mytool mb-2';
        listItem.dataset.index = index;
        
        // Task Text (with completion status)
        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        if (task.completed) {
            taskText.style.textDecoration = 'line-through';
            taskText.classList.add('text-muted');
        }
        
        // Buttons Container
        const buttonGroup = document.createElement('div');
        
        // 1. Complete/Toggle Button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = `btn btn-sm ${task.completed ? 'btn-success' : 'btn-outline-success'} me-2`;
        toggleBtn.innerHTML = `<i class="fa-solid ${task.completed ? 'fa-check-square' : 'fa-square'}"></i>`;
        toggleBtn.addEventListener('click', () => toggleTask(index));
        
        // 2. Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteTask(index));

        // Assemble the list item
        buttonGroup.appendChild(toggleBtn);
        buttonGroup.appendChild(deleteBtn);
        listItem.appendChild(taskText);
        listItem.appendChild(buttonGroup);
        
        taskListEl.appendChild(listItem);
    });
}

// --- CRUD Operations ---

/**
 * Adds a new task.
 */
function addTask() {
    const text = newTaskInputEl.value.trim();
    if (text === "") {
        alert("Task cannot be empty.");
        return;
    }

    // Add new task object to the array
    tasks.push({ text: text, completed: false });
    
    // Clear input and save/render
    newTaskInputEl.value = '';
    saveTasks();
    renderTasks();
}

/**
 * Toggles the 'completed' status of a task by its index.
 */
function toggleTask(index) {
    if (index >= 0 && index < tasks.length) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }
}

/**
 * Deletes a task by its index.
 */
function deleteTask(index) {
    if (index >= 0 && index < tasks.length) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }
}

/**
 * Clears all tasks.
 */
function clearAllTasks() {
    if (confirm("Are you sure you want to delete all tasks?")) {
        tasks = []; // Reset array
        saveTasks(); // Clear local storage
        renderTasks(); // Update DOM
    }
}

// --- Event Handlers ---

function handleAddButtonClick() {
    addTask();
}

function handleInputKeypress(e) {
    if (e.key === 'Enter') {
        addTask();
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    taskListEl = document.getElementById('task-list');
    newTaskInputEl = document.getElementById('new-task-input');
    addTaskBtnEl = document.getElementById('add-task-btn');
    clearAllBtnEl = document.getElementById('clear-all-btn');

    // 2. Load and render tasks immediately
    tasks = loadTasks();
    renderTasks();

    // 3. Attach listeners
    if (addTaskBtnEl) {
        addTaskBtnEl.addEventListener('click', handleAddButtonClick);
    }
    if (newTaskInputEl) {
        newTaskInputEl.addEventListener('keypress', handleInputKeypress);
    }
    if (clearAllBtnEl) {
        clearAllBtnEl.addEventListener('click', clearAllTasks);
    }
}

export function cleanup() {
    // Remove listeners
    if (addTaskBtnEl) {
        addTaskBtnEl.removeEventListener('click', handleAddButtonClick);
    }
    if (newTaskInputEl) {
        newTaskInputEl.removeEventListener('keypress', handleInputKeypress);
    }
    if (clearAllBtnEl) {
        clearAllBtnEl.removeEventListener('click', clearAllTasks);
    }
    // Note: We don't clear localStorage here, as the goal is persistence!
}