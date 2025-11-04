// js/tools/daily-journal.js

// --- DOM Elements ---
let form, titleInput, contentInput, idInput, entriesList, noEntriesMsg, clearFormBtn;

// --- State ---
let journalEntries = [];
const STORAGE_KEY = 'dailyJournalEntries';

// --- Local Storage Functions ---
const loadEntries = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    journalEntries = stored ? JSON.parse(stored) : [];
};

const saveEntries = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journalEntries));
};

// --- Rendering Functions ---

const renderEntriesList = () => {
    entriesList.innerHTML = '';
    if (journalEntries.length === 0) {
        noEntriesMsg.classList.remove('d-none');
        return;
    }
    noEntriesMsg.classList.add('d-none');

    // Sort entries by date, newest first
    const sortedEntries = [...journalEntries].sort((a, b) => b.id - a.id);

    sortedEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
        const entryDate = new Date(entry.id).toLocaleDateString();

        item.innerHTML = `
            <div class="ms-2 me-auto" style="cursor: pointer;">
                <div class="fw-bold">${entry.title}</div>
                <small class="text-muted">Saved on: ${entryDate}</small>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-danger delete-entry-btn" data-id="${entry.id}" title="Delete Entry">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        entriesList.appendChild(item);
    });
};

// --- Event Handlers ---

const handleFormSubmit = (event) => {
    event.preventDefault();
    const id = idInput.value;
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) return;

    if (id) { // Editing existing entry
        const index = journalEntries.findIndex(p => p.id == id);
        if (index > -1) {
            journalEntries[index] = { id: parseInt(id), title, content };
        }
    } else { // Adding new entry
        const newEntry = { id: Date.now(), title, content };
        journalEntries.push(newEntry);
    }

    saveEntries();
    renderEntriesList();
    clearForm();
};

const handleListClick = (event) => {
    const target = event.target;
    const deleteBtn = target.closest('.delete-entry-btn');
    const entryItem = target.closest('.list-group-item');

    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm('Are you sure you want to delete this journal entry?')) {
            journalEntries = journalEntries.filter(p => p.id != id);
            saveEntries();
            renderEntriesList();
            clearForm(); // Clear form in case the deleted entry was being edited
        }
    } else if (entryItem) { // Handle clicking the entry to edit
        const id = entryItem.querySelector('.delete-entry-btn').dataset.id;
        const entry = journalEntries.find(p => p.id == id);
        if (entry) {
            idInput.value = entry.id;
            titleInput.value = entry.title;
            contentInput.value = entry.content;
            titleInput.focus();
        }
    }
};

const clearForm = () => {
    form.reset();
    idInput.value = '';
};

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    form = document.getElementById('journal-form');
    titleInput = document.getElementById('entry-title-input');
    contentInput = document.getElementById('entry-content-input');
    idInput = document.getElementById('entry-id-input');
    entriesList = document.getElementById('saved-entries-list');
    noEntriesMsg = document.getElementById('no-entries-message');
    clearFormBtn = document.getElementById('clear-form-btn');

    // Load data and render
    loadEntries();
    renderEntriesList();

    // Attach event listeners
    form.addEventListener('submit', handleFormSubmit);
    entriesList.addEventListener('click', handleListClick);
    clearFormBtn.addEventListener('click', clearForm);
}

export function cleanup() {
    // Event listeners are attached to elements that will be removed from the DOM,
    // so manual removal is not strictly necessary for this tool.
}