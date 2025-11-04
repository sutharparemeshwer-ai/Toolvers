// js/tools/whac-a-mole.js

// DOM Elements
let grid, scoreDisplay, timeLeftDisplay, startBtn, gameStatus, difficultySelector;

// Game State
let score = 0;
let timeLeft = 30;
let activeLetter = null;
let activeSquareId = null;
let letterTimerId = null;
let countdownTimerId = null;
let isGameRunning = false;

const GRID_SIZE = 9;

function createGrid() {
    for (let i = 0; i < GRID_SIZE; i++) {
        const square = document.createElement('div');
        square.className = 'border bg-secondary d-flex align-items-center justify-content-center fs-1 fw-bold';
        square.id = i;
        square.style.width = '100px';
        square.style.height = '100px';
        square.style.float = 'left';
        grid.appendChild(square);
    }
}

function showRandomLetter() {
    // Clear previous letter
    if (activeSquareId !== null) {
        const oldSquare = document.getElementById(activeSquareId);
        if (oldSquare) {
            oldSquare.textContent = '';
        }
    }

    // Generate a random letter
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    activeLetter = alphabet[Math.floor(Math.random() * alphabet.length)];

    // Select a random square
    const randomIndex = Math.floor(Math.random() * GRID_SIZE);
    const randomSquare = document.getElementById(randomIndex);

    // Display the letter
    randomSquare.textContent = activeLetter;
    activeSquareId = randomSquare.id;
}

const handleKeyPress = (e) => {
    if (!isGameRunning || !activeLetter) return;

    if (e.key.toUpperCase() === activeLetter) {
        score++;
        scoreDisplay.textContent = score;
        activeLetter = null; // Prevent multiple scores for the same letter
        showRandomLetter(); // Immediately show a new letter for faster gameplay
    }
};

function countdown() {
    timeLeft--;
    timeLeftDisplay.textContent = timeLeft;

    if (timeLeft === 0) {
        endGame();
    }
}

function startGame() {
    isGameRunning = true;
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = score;
    timeLeftDisplay.textContent = timeLeft;
    gameStatus.textContent = 'Game in progress...';
    startBtn.disabled = true;
    // Disable difficulty controls during the game
    difficultySelector.querySelectorAll('input').forEach(input => input.disabled = true);

    // Get selected speed from difficulty radio buttons
    const selectedSpeed = document.querySelector('input[name="difficulty"]:checked').value;
    
    showRandomLetter();
    letterTimerId = setInterval(showRandomLetter, parseInt(selectedSpeed));
    countdownTimerId = setInterval(countdown, 1000);
    window.addEventListener('keydown', handleKeyPress);
}

function endGame() {
    isGameRunning = false;
    // Clear previous letter if game ends
    if (activeSquareId !== null) {
        const oldSquare = document.getElementById(activeSquareId);
        if (oldSquare) oldSquare.textContent = '';
    }
    clearInterval(countdownTimerId);
    clearInterval(letterTimerId);
    window.removeEventListener('keydown', handleKeyPress);
    gameStatus.textContent = `Game Over! Your final score is ${score}.`;
    startBtn.disabled = false;
    // Re-enable difficulty controls
    if (difficultySelector) {
        difficultySelector.querySelectorAll('input').forEach(input => input.disabled = false);
    }
}

export function init() {
    grid = document.getElementById('whac-a-mole-grid');
    scoreDisplay = document.getElementById('w-score');
    timeLeftDisplay = document.getElementById('w-time-left');
    startBtn = document.getElementById('w-start-btn');
    gameStatus = document.getElementById('w-game-status');
    difficultySelector = document.getElementById('difficulty-selector');

    createGrid();
    startBtn.addEventListener('click', startGame);
}

export function cleanup() {
    endGame();
    // Ensure listeners are removed if the tool is closed mid-game
    startBtn?.removeEventListener('click', startGame);
}