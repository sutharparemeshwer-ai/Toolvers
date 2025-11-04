// js/tools/memory-game-app.js

// DOM Elements
let gameBoardEl, movesCountEl, resetBtnEl, winMessageEl, finalMovesEl;

// Game State Variables
let cardsArray = []; // Stores the final shuffled set of cards
let hasFlippedCard = false;
let lockBoard = false;
let firstCard = null;
let secondCard = null;
let moves = 0;
let matchesFound = 0;

// Set of icons (16 cards total, 8 unique pairs)
const ICONS = [
    'fa-star', 'fa-moon', 'fa-sun', 'fa-cloud',
    'fa-heart', 'fa-bell', 'fa-bolt', 'fa-fire'
];

// --- Core Game Functions ---

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 */
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}

/**
 * Initializes the game board by generating, shuffling, and rendering cards.
 */
function setupGame() {
    // 1. Reset Game State
    moves = 0;
    matchesFound = 0;
    movesCountEl.textContent = moves;
    winMessageEl.classList.add('d-none');
    gameBoardEl.classList.remove('locked');
    gameBoardEl.innerHTML = '';
    
    // 2. Create the Card Array (Pairs)
    cardsArray = [...ICONS, ...ICONS]; // Duplicate icons to create pairs
    shuffle(cardsArray);

    // 3. Render Cards
    cardsArray.forEach((iconClass, index) => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        cardContainer.dataset.icon = iconClass; // Store the matching key
        
        // Card Front (The icon)
        const front = document.createElement('div');
        front.className = 'card-face card-front';
        front.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;

        // Card Back (The cover)
        const back = document.createElement('div');
        back.className = 'card-face card-back';
        back.innerHTML = '<i class="fa-solid fa-question"></i>'; // Optional visual for the back

        cardContainer.appendChild(front);
        cardContainer.appendChild(back);
        
        // Attach the click event
        cardContainer.addEventListener('click', flipCard);
        
        gameBoardEl.appendChild(cardContainer);
    });
}

/**
 * Handles the card flip mechanism.
 */
function flipCard() {
    // If the board is locked (waiting for mismatch timeout), or the card is already flipped/matched, ignore click
    if (lockBoard || this === firstCard || this.classList.contains('matched')) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        // First card flipped
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    // Second card flipped
    secondCard = this;
    moves++;
    movesCountEl.textContent = moves;

    checkForMatch();
}

/**
 * Checks if the two flipped cards are a match.
 */
function checkForMatch() {
    const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

/**
 * Cards match: remove the click listener and add 'matched' class.
 */
function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    matchesFound++;
    if (matchesFound === ICONS.length) {
        showWinMessage();
    }
    
    resetBoard();
}

/**
 * Cards mismatch: wait, then flip them back.
 */
function unflipCards() {
    lockBoard = true; // Lock the board during the waiting period
    
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000); // 1 second delay
}

/**
 * Resets the variables for the next turn.
 */
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

/**
 * Displays the victory message and final score.
 */
function showWinMessage() {
    winMessageEl.classList.remove('d-none');
    finalMovesEl.textContent = moves;
    gameBoardEl.classList.add('locked'); // Prevent further clicks
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    gameBoardEl = document.getElementById('game-board');
    movesCountEl = document.getElementById('moves-count');
    resetBtnEl = document.getElementById('reset-btn');
    winMessageEl = document.getElementById('win-message');
    finalMovesEl = document.getElementById('final-moves');

    // 2. Attach listeners
    if (resetBtnEl) {
        resetBtnEl.addEventListener('click', setupGame);
    }
    
    // 3. Start the game!
    setupGame();
}

export function cleanup() {
    // Remove listeners
    if (resetBtnEl) {
        resetBtnEl.removeEventListener('click', setupGame);
    }
    
    // Clear the board on navigation
    if (gameBoardEl) {
        gameBoardEl.innerHTML = '';
    }
    
    // Reset state variables
    resetBoard(); 
    moves = 0;
    matchesFound = 0;
    cardsArray = [];
}