// js/tools/mood-tracker.js

// --- DOM Elements ---
let moodForm, moodSelectionContainer, selectedMoodInput, notesInput, historyList;

// --- State ---
let moodHistory = [];
const STORAGE_KEY = 'moodTrackerHistory';
const MOOD_MAP = {
    happy: { icon: '😊', text: 'Happy' },
    good: { icon: '🙂', text: 'Good' },
    neutral: { icon: '😐', text: 'Neutral' },
    bad: { icon: '😕', text: 'Bad' },
    awful: { icon: '😠', text: 'Awful' }
};

// --- Local Storage Functions ---
const loadHistory = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    moodHistory = stored ? JSON.parse(stored) : [];
};

const saveHistory = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moodHistory));
};

// --- Rendering Functions ---
const renderHistory = () => {
    historyList.innerHTML = '';
    if (moodHistory.length === 0) {
        historyList.innerHTML = '<p class="text-muted text-center">No moods logged yet. Select a mood above to start!</p>';
        return;
    }

    const sortedHistory = [...moodHistory].sort((a, b) => b.date - a.date);

    sortedHistory.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        const moodInfo = MOOD_MAP[entry.mood] || { icon: '❓', text: 'Unknown' };
        const entryDate = new Date(entry.date).toLocaleDateString();

        item.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="fs-2 me-3">${moodInfo.icon}</span>
                <div>
                    <div class="fw-bold">${moodInfo.text} <small class="text-muted">on ${entryDate}</small></div>
                    ${entry.notes ? `<p class="mb-0 small">${entry.notes}</p>` : ''}
                </div>
            </div>
            <button class="btn btn-sm btn-outline-danger delete-mood-btn" data-id="${entry.date}" title="Delete Entry">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        historyList.appendChild(item);
    });
};

// --- Event Handlers ---
const handleMoodSelection = (event) => {
    const target = event.target.closest('.mood-btn');
    if (!target) return;

    // Update hidden input
    selectedMoodInput.value = target.dataset.mood;

    // Update visual selection
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    target.classList.add('selected');
};

const handleFormSubmit = (event) => {
    event.preventDefault();
    const mood = selectedMoodInput.value;
    const notes = notesInput.value.trim();

    if (!mood) {
        alert('Please select a mood!');
        return;
    }

    const newEntry = {
        date: Date.now(),
        mood,
        notes
    };

    moodHistory.push(newEntry);
    saveHistory();
    renderHistory();
    moodForm.reset();
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
};

const handleHistoryClick = (event) => {
    const deleteBtn = event.target.closest('.delete-mood-btn');
    if (!deleteBtn) return;

    const entryId = deleteBtn.dataset.id;
    if (confirm('Are you sure you want to delete this mood entry?')) {
        moodHistory = moodHistory.filter(entry => entry.date != entryId);
        saveHistory();
        renderHistory();
    }
};

// --- Router Hooks ---
export function init() {
    moodForm = document.getElementById('mood-form');
    moodSelectionContainer = document.getElementById('mood-selection');
    selectedMoodInput = document.getElementById('selected-mood-input');
    notesInput = document.getElementById('mood-notes-input');
    historyList = document.getElementById('mood-history-list');

    loadHistory();
    renderHistory();

    moodSelectionContainer.addEventListener('click', handleMoodSelection);
    moodForm.addEventListener('submit', handleFormSubmit);
    historyList.addEventListener('click', handleHistoryClick);
}

export function cleanup() {}