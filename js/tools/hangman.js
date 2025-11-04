// js/tools/hangman-app.js

// DOM Elements
let wordDisplayEl,
  wrongGuessesCountEl,
  keyboardContainerEl,
  resetBtnEl,
  gameMessageEl,
  hangmanDrawingEl;

// Game Configuration
const MAX_WRONG_GUESSES = 6;
const WORDS = [
  "JAVASCRIPT",
  "PYTHON",
  "HTML",
  "CSS",
  "CODE",
  "PROGRAMMING",
  "ALGORITHM",
  "FUNCTION",
  "VARIABLE",
  "DATABASE",
  "FRONTEND",
  "BACKEND",
];

// Game State
let secretWord = "";
let guessedLetters = [];
let wrongGuesses = 0;
let isGameOver = false;

// --- Core Game Functions ---

/**
 * Initializes or resets the game state.
 */
function initializeGame() {
  // 1. Reset State
  secretWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  guessedLetters = [];
  wrongGuesses = 0;
  isGameOver = false;

  // 2. Reset DOM
  renderWordDisplay();
  renderKeyboard();
  updateDrawing();
  wrongGuessesCountEl.textContent = wrongGuesses;
  gameMessageEl.textContent = "Guess a letter!";
  gameMessageEl.classList.remove("text-success", "text-danger");
  gameMessageEl.classList.add("text-info");
}

/**
 * Renders the hidden word with correctly guessed letters.
 */
function renderWordDisplay() {
  let display = "";
  let wordGuessed = true;
  for (const letter of secretWord) {
    if (guessedLetters.includes(letter)) {
      display += letter;
    } else {
      display += "_";
      wordGuessed = false;
    }
  }
  wordDisplayEl.textContent = display.split("").join(" "); // Add spaces for visual separation

  if (wordGuessed && !isGameOver) {
    endGame(true);
  }
}

/**
 * Creates and renders the A-Z keyboard buttons.
 */
function renderKeyboard() {
  // This function is no longer needed as we are removing the on-screen keyboard.
  keyboardContainerEl.innerHTML =
    '<p class="text-muted small">Use your physical keyboard to guess letters.</p>';
}

/**
 * Adds the appropriate SVG parts to the drawing based on wrong guesses.
 */
function updateDrawing() {
  const parts = hangmanDrawingEl.querySelectorAll(".hangman-part");
  parts.forEach((part, index) => {
    // If the part's index is less than the number of wrong guesses, make it visible.
    if (index < wrongGuesses) {
      part.classList.add("visible");
    }
  });
}

// --- Game Logic ---

/**
 * Handles a user's letter guess.
 */
function handleGuess(letter) {
  if (isGameOver || guessedLetters.includes(letter)) return;

  guessedLetters.push(letter);

  if (secretWord.includes(letter)) {
    // Correct guess
    renderWordDisplay();
  } else {
    // Wrong guess
    wrongGuesses++;
    wrongGuessesCountEl.textContent = wrongGuesses;
    updateDrawing();

    if (wrongGuesses >= MAX_WRONG_GUESSES) {
      endGame(false);
    }
  }
}

/**
 * Handles a physical keyboard press.
 * @param {KeyboardEvent} e - The keyboard event.
 */
function handleKeyPress(e) {
  if (isGameOver) return;

  const letter = e.key.toUpperCase();
  // Check if the key pressed is a single letter from A-Z
  if (letter.match(/^[A-Z]$/)) {
    handleGuess(letter);
  }
}

/**
 * Ends the game and updates the UI for win or loss.
 */
function endGame(win) {
  isGameOver = true;

  if (win) {
    gameMessageEl.textContent = "You Won! 🎉";
    gameMessageEl.classList.remove("text-info");
    gameMessageEl.classList.add("text-success");
  } else {
    gameMessageEl.textContent = `Game Over! The word was: ${secretWord}`;
    gameMessageEl.classList.remove("text-info");
    gameMessageEl.classList.add("text-danger");
  }
}

// --- Router Hooks ---

export function init() {
  // 1. Get DOM elements
  wordDisplayEl = document.getElementById("word-display");
  wrongGuessesCountEl = document.getElementById("wrong-guesses-count");
  keyboardContainerEl = document.getElementById("keyboard-container");
  resetBtnEl = document.getElementById("reset-btn");
  gameMessageEl = document.getElementById("game-message");
  hangmanDrawingEl = document.getElementById("hangman-drawing");

  // 2. Attach listeners
  if (resetBtnEl) {
    resetBtnEl.addEventListener("click", initializeGame);
  }

  // Hide all hangman parts initially
  hangmanDrawingEl
    .querySelectorAll(".hangman-part")
    .forEach((part) => part.classList.remove("visible"));

  document.addEventListener("keydown", handleKeyPress);

  // 3. Start the game!
  initializeGame();
}

export function cleanup() {
  if (resetBtnEl) {
    resetBtnEl.removeEventListener("click", initializeGame);
  }
  document.removeEventListener("keydown", handleKeyPress);

  // Hide all hangman parts on cleanup
  if (hangmanDrawingEl) {
    hangmanDrawingEl
      .querySelectorAll(".hangman-part")
      .forEach((part) => part.classList.remove("visible"));
  }
  // No need to clear innerHTML as initializeGame resets it on load
}
