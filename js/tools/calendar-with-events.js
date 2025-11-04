// js/tools/calendar-with-events.js

// --- DOM Elements ---
let monthYearHeader, calendarContainer, eventsList, selectedDateDisplay;
let prevMonthBtn, nextMonthBtn, todayBtn, addEventBtn, eventForm;
let modalEl, modalInstance;

// --- State ---
let currentDate = new Date();
let selectedDate = new Date();
let events = {}; // { 'YYYY-MM-DD': [{ name, time, id }, ...] }
const STORAGE_KEY = 'calendarEvents';

// --- Local Storage ---
const loadEvents = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    events = stored ? JSON.parse(stored) : {};
};

const saveEvents = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

// --- Rendering ---

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearHeader.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

    calendarContainer.innerHTML = '';

    // Day labels
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const label = document.createElement('div');
        label.className = 'weekday-label';
        label.textContent = day;
        calendarContainer.appendChild(label);
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty slots for the first day
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarContainer.appendChild(emptyDay);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        dayEl.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayEl.classList.add('today');
        }

        if (dayEl.dataset.date === selectedDate.toISOString().split('T')[0]) {
            dayEl.classList.add('selected');
        }

        if (events[dayEl.dataset.date]) {
            dayEl.classList.add('has-event');
        }

        calendarContainer.appendChild(dayEl);
    }

    renderEventsForDate(selectedDate);
}

function renderEventsForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    selectedDateDisplay.textContent = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    eventsList.innerHTML = '';
    const dayEvents = events[dateString] || [];

    if (dayEvents.length === 0) {
        eventsList.innerHTML = '<p class="text-muted text-center">No events for this day.</p>';
        return;
    }

    dayEvents.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    dayEvents.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = 'list-group-item d-flex justify-content-between align-items-center';
        eventEl.innerHTML = `
            <div>
                <span class="fw-bold">${event.name}</span>
                ${event.time ? `<br><small class="text-muted">${event.time}</small>` : ''}
            </div>
            <button class="btn btn-sm btn-outline-danger delete-event-btn" data-id="${event.id}">&times;</button>
        `;
        eventsList.appendChild(eventEl);
    });
}

// --- Event Handlers ---

function handleMonthChange(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
}

function handleGoToToday() {
    currentDate = new Date();
    selectedDate = new Date();
    renderCalendar();
}

function handleDayClick(e) {
    const target = e.target.closest('.calendar-day:not(.empty)');
    if (!target) return;

    selectedDate = new Date(target.dataset.date + 'T00:00:00'); // Avoid timezone issues
    renderCalendar();
}

function handleFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('event-name').value.trim();
    const time = document.getElementById('event-time').value;
    if (!name) return;

    const dateString = selectedDate.toISOString().split('T')[0];
    if (!events[dateString]) {
        events[dateString] = [];
    }

    events[dateString].push({ id: Date.now(), name, time });
    saveEvents();
    renderCalendar();
    modalInstance.hide();
    eventForm.reset();
}

function handleEventDelete(e) {
    const target = e.target.closest('.delete-event-btn');
    if (!target) return;

    const eventId = parseInt(target.dataset.id);
    const dateString = selectedDate.toISOString().split('T')[0];

    events[dateString] = events[dateString].filter(event => event.id !== eventId);
    if (events[dateString].length === 0) {
        delete events[dateString];
    }

    saveEvents();
    renderCalendar();
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    monthYearHeader = document.getElementById('month-year-header');
    calendarContainer = document.getElementById('calendar-container');
    eventsList = document.getElementById('events-list');
    selectedDateDisplay = document.getElementById('selected-date-display');
    prevMonthBtn = document.getElementById('prev-month-btn');
    nextMonthBtn = document.getElementById('next-month-btn');
    todayBtn = document.getElementById('today-btn');
    addEventBtn = document.getElementById('add-event-btn');
    eventForm = document.getElementById('event-form');
    modalEl = document.getElementById('event-modal');
    modalInstance = new bootstrap.Modal(modalEl);

    // Load data and render
    loadEvents();
    renderCalendar();

    // Attach listeners
    prevMonthBtn.addEventListener('click', () => handleMonthChange(-1));
    nextMonthBtn.addEventListener('click', () => handleMonthChange(1));
    todayBtn.addEventListener('click', handleGoToToday);
    calendarContainer.addEventListener('click', handleDayClick);
    eventForm.addEventListener('submit', handleFormSubmit);
    eventsList.addEventListener('click', handleEventDelete);
}

export function cleanup() {
    if (modalInstance) modalInstance.dispose();
}