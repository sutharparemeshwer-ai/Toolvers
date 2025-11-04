// js/tools/notes.js
const STORAGE_KEY = 'my_local_notes_v1';
let isEditing = false;
let currentNoteId = null;

// Helper function to get all notes from localStorage
function getNotes() {
    const notesJson = localStorage.getItem(STORAGE_KEY);
    return notesJson ? JSON.parse(notesJson) : [];
}

// Helper function to save the entire notes array to localStorage
function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// ------------------------------------
// READ: Render the notes list
// ------------------------------------
function renderNotes() {
    const notes = getNotes();
    const listContainer = document.getElementById('notes-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';

    if (notes.length === 0) {
        listContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No notes found. Start by creating one!</div></div>';
        return;
    }

    notes.forEach(note => {
        const noteHtml = `
            <div class="col">
                <div class="card h-100 p-3 mytool shadow-sm border-white">
                    <h6 class="card-title">${note.title}</h6>
                    <p class="card-text small">${note.content}</p>
                    <p class="small mb-2">Created: ${new Date(note.timestamp).toLocaleDateString()}</p>
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn btn-sm btn-light edit-btn" data-id="${note.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${note.id}">Delete</button>
                    </div>
                </div>
            </div>
        `;
        listContainer.innerHTML += noteHtml;
    });

    // Attach event listeners for Edit and Delete buttons to the new HTML
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

// ------------------------------------
// CREATE / UPDATE: Handle Form Submission
// ------------------------------------
function handleSaveNote(e) {
    e.preventDefault();
    
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    
    if (!title || !content) return;

    let notes = getNotes();

    if (isEditing) {
        // UPDATE Logic
        const noteIndex = notes.findIndex(n => n.id === currentNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex].title = title;
            notes[noteIndex].content = content;
        }
        // Reset editing state
        isEditing = false;
        currentNoteId = null;
        document.getElementById('save-note-btn').textContent = 'Save Note';
        document.getElementById('cancel-edit-btn').classList.add('d-none');
    } else {
        // CREATE Logic
        const newNote = {
            id: Date.now(), // Use timestamp as a unique ID
            title: title,
            content: content,
            timestamp: Date.now()
        };
        notes.unshift(newNote); // Add to the beginning of the array
    }

    saveNotes(notes);
    document.getElementById('note-form').reset();
    renderNotes();
}

// ------------------------------------
// UPDATE: Load data into form
// ------------------------------------
function handleEdit(e) {
    const id = Number(e.target.dataset.id);
    const notes = getNotes();
    const noteToEdit = notes.find(n => n.id === id);

    if (noteToEdit) {
        // Set form values
        document.getElementById('note-title').value = noteToEdit.title;
        document.getElementById('note-content').value = noteToEdit.content;

        // Change button state
        isEditing = true;
        currentNoteId = id;
        document.getElementById('save-note-btn').textContent = 'Update Note';
        document.getElementById('cancel-edit-btn').classList.remove('d-none');
        document.getElementById('note-title').focus(); // Bring focus to the form
    }
}

// ------------------------------------
// DELETE: Remove a note
// ------------------------------------
function handleDelete(e) {
    const id = Number(e.target.dataset.id);
    let notes = getNotes();
    
    // Filter out the note with the matching ID
    notes = notes.filter(n => n.id !== id);
    
    saveNotes(notes);
    renderNotes();
}

// ------------------------------------
// Router Lifecycle Functions
// ------------------------------------

let formHandler, cancelHandler;

export function init() {
    // 1. Attach form submission handler
    const form = document.getElementById('note-form');
    if (form) {
        formHandler = handleSaveNote;
        form.addEventListener('submit', formHandler);
    }
    
    // 2. Attach cancel button handler (used for editing)
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
        cancelHandler = () => {
            document.getElementById('note-form').reset();
            isEditing = false;
            currentNoteId = null;
            document.getElementById('save-note-btn').textContent = 'Save Note';
            cancelBtn.classList.add('d-none');
        };
        cancelBtn.addEventListener('click', cancelHandler);
    }

    // 3. Initial load of notes
    renderNotes();
}

export function cleanup() {
    // Remove main form handler
    const form = document.getElementById('note-form');
    if (form && formHandler) {
        form.removeEventListener('submit', formHandler);
    }
    
    // Remove cancel button handler
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn && cancelHandler) {
        cancelBtn.removeEventListener('click', cancelHandler);
    }
    
    // NOTE: Edit and Delete button listeners are dynamically attached/removed 
    // within renderNotes(), so no need to clean them up here.
}