// js/tools/study-helper.js

// --- DOM Elements ---
let timerDisplay, startPauseBtn, resetBtn, modeButtons;
let taskForm, taskInput, taskList, emptyTasksMsg, clearTasksBtn;

// --- State ---
const DURATIONS = { pomodoro: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
let currentMode = 'pomodoro';
let currentTime = DURATIONS.pomodoro;
let isRunning = false;
let timerInterval = null;
let tasks = [];

// --- Timer Functions ---

function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(currentTime);
    document.title = `${formatTime(currentTime)} - Study Helper`;
}

function setMode(newMode) {
    if (isRunning) return;
    currentMode = newMode;
    currentTime = DURATIONS[currentMode];
    updateTimerDisplay();

    modeButtons.forEach(btn => {
        btn.classList.replace('btn-primary', 'btn-secondary');
        btn.classList.remove('active');
        if (btn.dataset.mode === newMode) {
            btn.classList.replace('btn-secondary', 'btn-primary');
            btn.classList.add('active');
        }
    });
}

function tick() {
    if (currentTime > 0) {
        currentTime--;
        updateTimerDisplay();
    } else {
        clearInterval(timerInterval);
        isRunning = false;
        startPauseBtn.textContent = 'Start';
        new Notification('Study Helper', {
            body: `Time for your ${currentMode === 'pomodoro' ? 'break' : 'focus session'}!`,
            icon: './assets/images/favicon.png'
        });
        // Automatically switch to the next logical mode
        const nextMode = currentMode === 'pomodoro' ? 'shortBreak' : 'pomodoro';
        setMode(nextMode);
    }
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        startPauseBtn.textContent = 'Resume';
    } else {
        isRunning = true;
        startPauseBtn.textContent = 'Pause';
        timerInterval = setInterval(tick, 1000);
    }
    resetBtn.disabled = !isRunning;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    currentTime = DURATIONS[currentMode];
    updateTimerDisplay();
    startPauseBtn.textContent = 'Start';
    resetBtn.disabled = true;
}

// --- Task List Functions ---

function renderTasks() {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
        emptyTasksMsg.classList.remove('d-none');
        taskList.appendChild(emptyTasksMsg);
    } else {
        emptyTasksMsg.classList.add('d-none');
        tasks.forEach((task, index) => {
            const taskEl = document.createElement('div');
            taskEl.className = 'list-group-item d-flex justify-content-between align-items-center';
            taskEl.innerHTML = `
                <span class="task-text ${task.completed ? 'text-decoration-line-through text-muted' : ''}">${task.text}</span>
                <div>
                    <button class="btn btn-sm btn-outline-success toggle-task-btn" data-index="${index}">✓</button>
                    <button class="btn btn-sm btn-outline-danger delete-task-btn" data-index="${index}">×</button>
                </div>
            `;
            taskList.appendChild(taskEl);
        });
    }
}

function handleTaskFormSubmit(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (text) {
        tasks.push({ text, completed: false });
        taskInput.value = '';
        renderTasks();
    }
}

function handleTaskListClick(e) {
    const target = e.target;
    const index = target.dataset.index;
    if (index === undefined) return;

    if (target.classList.contains('toggle-task-btn')) {
        tasks[index].completed = !tasks[index].completed;
    } else if (target.classList.contains('delete-task-btn')) {
        tasks.splice(index, 1);
    }
    renderTasks();
}

function handleClearTasks() {
    if (confirm('Are you sure you want to clear all tasks for this session?')) {
        tasks = [];
        renderTasks();
    }
}

// --- Router Hooks ---

export function init() {
    // Timer elements
    timerDisplay = document.getElementById('study-timer-display');
    startPauseBtn = document.getElementById('study-start-pause-btn');
    resetBtn = document.getElementById('study-reset-btn');
    modeButtons = document.querySelectorAll('.mode-btn');

    // Task list elements
    taskForm = document.getElementById('study-task-form');
    taskInput = document.getElementById('study-task-input');
    taskList = document.getElementById('study-task-list');
    emptyTasksMsg = document.getElementById('study-empty-tasks-msg');
    clearTasksBtn = document.getElementById('study-clear-tasks-btn');

    // Initial setup
    updateTimerDisplay();
    renderTasks();

    // Attach listeners
    startPauseBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);
    modeButtons.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
    taskForm.addEventListener('submit', handleTaskFormSubmit);
    taskList.addEventListener('click', handleTaskListClick);
    clearTasksBtn.addEventListener('click', handleClearTasks);
}

export function cleanup() {
    clearInterval(timerInterval);
    document.title = 'Tools Portfolio';
}