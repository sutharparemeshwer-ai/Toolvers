// js/tools/interactive-story-builder.js

// --- DOM Elements ---
let storyPartsList, editorPanel, editorPlaceholder, form;
let partIdInput, partTitleInput, partTextInput, choicesContainer;
let addNewPartBtn, addChoiceBtn, deletePartBtn, playStoryBtn;
let playerModal, playerModalInstance, playerTitle, playerSceneText, playerChoicesContainer;

// --- State ---
let storyData = {};
let currentEditingPartId = null;
const STORAGE_KEY = 'interactiveStoryData';

// --- Local Storage ---
const loadStory = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    storyData = stored ? JSON.parse(stored) : {};
};

const saveStory = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storyData));
};

// --- Rendering ---

function renderStoryPartsList() {
    storyPartsList.innerHTML = '';
    if (Object.keys(storyData).length === 0) {
        storyPartsList.innerHTML = '<p class="text-muted small">No story parts yet.</p>';
        playStoryBtn.disabled = true;
        return;
    }
    playStoryBtn.disabled = false;
    Object.keys(storyData).forEach(partId => {
        const part = storyData[partId];
        const item = document.createElement('a');
        item.href = '#';
        item.className = `list-group-item list-group-item-action ${partId === currentEditingPartId ? 'active' : ''}`;
        item.textContent = part.title || `Part ${partId}`;
        item.dataset.partId = partId;
        storyPartsList.appendChild(item);
    });
}

function renderEditor(partId) {
    currentEditingPartId = partId;
    const part = storyData[partId];
    if (!part) return;

    editorPlaceholder.classList.add('d-none');
    editorPanel.classList.remove('d-none');

    partIdInput.value = partId;
    partTitleInput.value = part.title;
    partTextInput.value = part.text;
    deletePartBtn.disabled = Object.keys(storyData).length <= 1;

    choicesContainer.innerHTML = '';
    part.choices.forEach((choice, index) => {
        addChoiceInput(choice.text, choice.target);
    });

    renderStoryPartsList();
}

function addChoiceInput(text = '', target = '') {
    const choiceIndex = choicesContainer.children.length;
    const choiceDiv = document.createElement('div');
    choiceDiv.className = 'input-group mb-2';
    choiceDiv.innerHTML = `
        <input type="text" class="form-control choice-text" placeholder="Choice text" value="${text}">
        <span class="input-group-text">→</span>
        <select class="form-select choice-target">${generatePartOptions(target)}</select>
        <button type="button" class="btn btn-outline-danger remove-choice-btn">×</button>
    `;
    choicesContainer.appendChild(choiceDiv);
}

function generatePartOptions(selectedPartId) {
    return Object.keys(storyData)
        .map(partId => `<option value="${partId}" ${partId === selectedPartId ? 'selected' : ''}>${storyData[partId].title || `Part ${partId}`}</option>`)
        .join('');
}

function renderPlayerScene(partId) {
    const part = storyData[partId];
    if (!part) {
        playerSceneText.textContent = 'The story ends here.';
        playerChoicesContainer.innerHTML = '';
        return;
    }
    playerTitle.textContent = part.title;
    playerSceneText.textContent = part.text || '(This part has no text.)';
    playerChoicesContainer.innerHTML = '';
    part.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-light';
        button.textContent = choice.text;
        button.dataset.target = choice.target;
        playerChoicesContainer.appendChild(button);
    });
}

// --- Event Handlers ---

function handleAddNewPart() {
    const newPartId = `part_${Date.now()}`;
    storyData[newPartId] = { title: 'New Part', text: '', choices: [] };
    saveStory();
    renderEditor(newPartId);
}

function handleFormSubmit(e) {
    e.preventDefault();
    const partId = partIdInput.value;
    const choices = [];
    choicesContainer.querySelectorAll('.input-group').forEach(group => {
        const text = group.querySelector('.choice-text').value.trim();
        const target = group.querySelector('.choice-target').value;
        if (text && target) {
            choices.push({ text, target });
        }
    });

    storyData[partId] = {
        title: partTitleInput.value.trim(),
        text: partTextInput.value.trim(),
        choices: choices
    };
    saveStory();
    renderStoryPartsList();
    alert('Part saved!');
}

function handleDeletePart() {
    if (!currentEditingPartId || Object.keys(storyData).length <= 1) return;
    if (confirm(`Are you sure you want to delete "${storyData[currentEditingPartId].title}"?`)) {
        delete storyData[currentEditingPartId];
        // Clean up choices pointing to the deleted part
        Object.values(storyData).forEach(part => {
            part.choices = part.choices.filter(c => c.target !== currentEditingPartId);
        });
        saveStory();
        currentEditingPartId = null;
        editorPanel.classList.add('d-none');
        editorPlaceholder.classList.remove('d-none');
        renderStoryPartsList();
    }
}

function handlePlayStory() {
    const startPartId = Object.keys(storyData)[0];
    if (!startPartId) return;
    renderPlayerScene(startPartId);
    playerModalInstance.show();
}

// --- Init & Cleanup ---

export function init() {
    // Get DOM elements
    storyPartsList = document.getElementById('story-parts-list');
    editorPanel = document.getElementById('editor-panel');
    editorPlaceholder = document.getElementById('editor-placeholder');
    form = document.getElementById('story-part-form');
    partIdInput = document.getElementById('part-id-input');
    partTitleInput = document.getElementById('part-title-input');
    partTextInput = document.getElementById('part-text-input');
    choicesContainer = document.getElementById('choices-container');
    addNewPartBtn = document.getElementById('add-new-part-btn');
    addChoiceBtn = document.getElementById('add-choice-btn');
    deletePartBtn = document.getElementById('delete-part-btn');
    playStoryBtn = document.getElementById('play-story-btn');
    playerModal = document.getElementById('story-player-modal');
    playerTitle = document.getElementById('storyPlayerModalLabel');
    playerSceneText = document.getElementById('player-scene-text');
    playerChoicesContainer = document.getElementById('player-choices-container');
    playerModalInstance = new bootstrap.Modal(playerModal);

    // Load data and render
    loadStory();
    renderStoryPartsList();

    // Attach event listeners
    addNewPartBtn.addEventListener('click', handleAddNewPart);
    form.addEventListener('submit', handleFormSubmit);
    deletePartBtn.addEventListener('click', handleDeletePart);
    playStoryBtn.addEventListener('click', handlePlayStory);
    addChoiceBtn.addEventListener('click', () => addChoiceInput());

    storyPartsList.addEventListener('click', e => {
        e.preventDefault();
        const partId = e.target.dataset.partId;
        if (partId) renderEditor(partId);
    });

    choicesContainer.addEventListener('click', e => {
        if (e.target.closest('.remove-choice-btn')) {
            e.target.closest('.input-group').remove();
        }
    });

    playerChoicesContainer.addEventListener('click', e => {
        const targetId = e.target.dataset.target;
        if (targetId) renderPlayerScene(targetId);
    });
}

export function cleanup() {
    // Remove all listeners (simplified for brevity)
    // In a real app, you'd store and remove specific listener functions
    const newInit = document.getElementById('app').cloneNode(true);
    document.getElementById('app').parentNode.replaceChild(newInit, document.getElementById('app'));

    if (playerModalInstance) {
        playerModalInstance.dispose();
    }
}