// js/tools/interactive-flashcard-app.js

// --- DOM Elements ---
let flashcardEl, cardQuestionEl, cardAnswerEl, cardCounterEl, emptyCardsMsg, cardsListEl;
let prevBtn, nextBtn, flipBtn, form, modalInstance;

// --- State ---
let flashcards = [];
let currentCardIndex = 0;
const STORAGE_KEY = 'flashcardsData';

// --- Local Storage Functions ---
const loadFlashcards = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    flashcards = stored ? JSON.parse(stored) : [];
};

const saveFlashcards = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
};

// --- Rendering Functions ---

const renderCurrentCard = () => {
    if (flashcards.length === 0) {
        cardQuestionEl.textContent = 'No cards available.';
        cardAnswerEl.textContent = 'Add a new card below to start studying!';
        cardCounterEl.textContent = 'Card 0 / 0';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        flipBtn.disabled = true;
        return;
    }

    flipBtn.disabled = false;
    const card = flashcards[currentCardIndex];
    cardQuestionEl.textContent = card.question;
    cardAnswerEl.textContent = card.answer;
    cardCounterEl.textContent = `Card ${currentCardIndex + 1} / ${flashcards.length}`;

    prevBtn.disabled = currentCardIndex === 0;
    nextBtn.disabled = currentCardIndex === flashcards.length - 1;
};

const renderCardList = () => {
    cardsListEl.innerHTML = '';
    if (flashcards.length === 0) {
        emptyCardsMsg.classList.remove('d-none');
        return;
    }
    emptyCardsMsg.classList.add('d-none');

    flashcards.forEach((card, index) => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span class="small">${card.question}</span>
            <button class="btn btn-sm btn-outline-danger delete-card-btn" data-index="${index}">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        cardsListEl.appendChild(item);
    });
};

const updateAll = () => {
    renderCurrentCard();
    renderCardList();
};

// --- Event Handlers ---

const handleFlip = () => flashcardEl.classList.toggle('is-flipped');

const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
        currentCardIndex++;
        flashcardEl.classList.remove('is-flipped');
        renderCurrentCard();
    }
};

const handlePrev = () => {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        flashcardEl.classList.remove('is-flipped');
        renderCurrentCard();
    }
};

const handleFormSubmit = (event) => {
    event.preventDefault();
    const question = form.querySelector('#card-question-input').value.trim();
    const answer = form.querySelector('#card-answer-input').value.trim();

    if (question && answer) {
        flashcards.push({ question, answer });
        saveFlashcards();
        currentCardIndex = flashcards.length - 1; // Go to the new card
        updateAll();
        modalInstance.hide();
        form.reset();
    }
};

const handleListClick = (event) => {
    const target = event.target.closest('.delete-card-btn');
    if (!target) return;

    const indexToDelete = parseInt(target.dataset.index);
    if (confirm('Are you sure you want to delete this flashcard?')) {
        flashcards.splice(indexToDelete, 1);
        saveFlashcards();
        if (currentCardIndex >= flashcards.length && flashcards.length > 0) {
            currentCardIndex = flashcards.length - 1;
        }
        updateAll();
    }
};

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    flashcardEl = document.getElementById('flashcard');
    cardQuestionEl = document.getElementById('flashcard-question');
    cardAnswerEl = document.getElementById('flashcard-answer');
    cardCounterEl = document.getElementById('card-counter');
    emptyCardsMsg = document.getElementById('empty-cards-message');
    cardsListEl = document.getElementById('flashcards-list');
    prevBtn = document.getElementById('prev-card-btn');
    nextBtn = document.getElementById('next-card-btn');
    flipBtn = document.getElementById('flip-card-btn');
    form = document.getElementById('flashcard-form');
    const modalEl = document.getElementById('flashcard-form-modal');
    modalInstance = new bootstrap.Modal(modalEl);

    // Load data and render
    loadFlashcards();
    updateAll();

    // Attach event listeners
    flipBtn.addEventListener('click', handleFlip);
    nextBtn.addEventListener('click', handleNext);
    prevBtn.addEventListener('click', handlePrev);
    form.addEventListener('submit', handleFormSubmit);
    cardsListEl.addEventListener('click', handleListClick);
}

export function cleanup() {
    // Remove event listeners
    flipBtn.removeEventListener('click', handleFlip);
    nextBtn.removeEventListener('click', handleNext);
    prevBtn.removeEventListener('click', handlePrev);
    form.removeEventListener('submit', handleFormSubmit);
    cardsListEl.removeEventListener('click', handleListClick);

    if (modalInstance) {
        modalInstance.dispose();
    }
}