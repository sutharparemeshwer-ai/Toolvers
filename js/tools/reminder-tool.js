// js/tools/reminder-tool.js

// --- DOM Elements ---
let permissionAlert, permissionBtn, reminderForm, reminderText, reminderTime, remindersList, noRemindersMsg;

// --- State ---
let reminders = [];
let reminderTimeouts = {}; // Store timeout IDs
const STORAGE_KEY = 'appReminders';

// --- Local Storage & State ---
const loadReminders = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    reminders = stored ? JSON.parse(stored) : [];
};

const saveReminders = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
};

// --- Core Logic ---
const scheduleNotification = (reminder) => {
    const now = Date.now();
    const timeToRemind = new Date(reminder.time).getTime();
    const delay = timeToRemind - now;

    if (delay <= 0) return; // Don't schedule past reminders

    // Clear any existing timeout for this reminder ID
    if (reminderTimeouts[reminder.id]) {
        clearTimeout(reminderTimeouts[reminder.id]);
    }

    reminderTimeouts[reminder.id] = setTimeout(() => {
        new Notification('Reminder!', {
            body: reminder.text,
            icon: './assets/images/favicon.png' // Optional: Add an icon
        });
        // Remove reminder after it has fired
        reminders = reminders.filter(r => r.id !== reminder.id);
        saveReminders();
        renderReminders();
    }, delay);
};

const cancelReminder = (id) => {
    if (reminderTimeouts[id]) {
        clearTimeout(reminderTimeouts[id]);
        delete reminderTimeouts[id];
    }
    reminders = reminders.filter(r => r.id !== id);
    saveReminders();
    renderReminders();
};

// --- Rendering ---
const renderReminders = () => {
    remindersList.innerHTML = '';
    if (reminders.length === 0) {
        noRemindersMsg.classList.remove('d-none');
        return;
    }
    noRemindersMsg.classList.add('d-none');

    const sorted = [...reminders].sort((a, b) => new Date(a.time) - new Date(b.time));

    sorted.forEach(reminder => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        const formattedTime = new Date(reminder.time).toLocaleString();

        item.innerHTML = `
            <div>
                <div class="fw-bold">${reminder.text}</div>
                <small class="text-muted">${formattedTime}</small>
            </div>
            <button class="btn btn-sm btn-outline-danger cancel-reminder-btn" data-id="${reminder.id}" title="Cancel Reminder">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        remindersList.appendChild(item);
    });
};

// --- Event Handlers ---
const handleFormSubmit = (event) => {
    event.preventDefault();
    const text = reminderText.value.trim();
    const time = reminderTime.value;

    if (!text || !time) return;

    const reminderTimeMs = new Date(time).getTime();
    if (reminderTimeMs <= Date.now()) {
        alert('Please select a future time for the reminder.');
        return;
    }

    const newReminder = {
        id: Date.now(),
        text,
        time
    };

    reminders.push(newReminder);
    saveReminders();
    scheduleNotification(newReminder);
    renderReminders();
    reminderForm.reset();
};

const handlePermissionRequest = async () => {
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notification.');
        return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        permissionAlert.classList.add('d-none');
    }
};

// --- Initialization & Cleanup ---
export function init() {
    permissionAlert = document.getElementById('permission-alert');
    permissionBtn = document.getElementById('permission-btn');
    reminderForm = document.getElementById('reminder-form');
    reminderText = document.getElementById('reminder-text');
    reminderTime = document.getElementById('reminder-time');
    remindersList = document.getElementById('reminders-list');
    noRemindersMsg = document.getElementById('no-reminders-message');

    if ('Notification' in window && Notification.permission !== 'granted') {
        permissionAlert.classList.remove('d-none');
    }

    loadReminders();
    reminders = reminders.filter(r => new Date(r.time).getTime() > Date.now()); // Clean up past reminders on load
    saveReminders();
    reminders.forEach(scheduleNotification); // Re-schedule all pending reminders
    renderReminders();

    permissionBtn.addEventListener('click', handlePermissionRequest);
    reminderForm.addEventListener('submit', handleFormSubmit);
    remindersList.addEventListener('click', (e) => {
        if (e.target.closest('.cancel-reminder-btn')) {
            cancelReminder(e.target.closest('.cancel-reminder-btn').dataset.id);
        }
    });
}

export function cleanup() {
    // Clear all scheduled timeouts when leaving the tool
    Object.values(reminderTimeouts).forEach(clearTimeout);
}