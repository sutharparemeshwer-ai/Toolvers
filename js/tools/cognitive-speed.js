// js/tools/iq-checker.js

// --- Configuration ---
const PROBLEM_GENERATORS = [
    // Addition
    () => {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        return [`${a} + ${b}`, a + b];
    },
    // Subtraction
    () => {
        const a = Math.floor(Math.random() * 15) + 5;
        const b = Math.floor(Math.random() * (a - 4)) + 1;
        return [`${a} - ${b}`, a - b];
    },
    // Multiplication (Simple)
    () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        return [`${a} * ${b}`, a * b];
    }
];
const TOTAL_PROBLEMS = 10;

// --- Game State ---
let currentProblem = null;
let currentProblemIndex = 0;
let correctCount = 0;
let startTime = 0;
let timerInterval = null;

// --- DOM Elements ---
let gameAreaEl, resultsAreaEl, startButtonEl, restartButtonEl, answerFormEl, answerInputEl;
let timerDisplayEl, problemCounterEl, questionDisplayEl, feedbackEl, finalCorrectEl, finalTimeEl;

// --- Timer Logic ---
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 10); // Update every 10ms for millisecond accuracy
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimer() {
    const elapsed = Date.now() - startTime;
    timerDisplayEl.textContent = (elapsed / 1000).toFixed(2) + 's';
}

// --- Game Flow Logic ---

function setupNewProblem() {
    if (currentProblemIndex >= TOTAL_PROBLEMS) {
        return finishGame();
    }
    
    // Select a random generator
    const generator = PROBLEM_GENERATORS[Math.floor(Math.random() * PROBLEM_GENERATORS.length)];
    
    // Generate the problem
    const [question, answer] = generator();
    currentProblem = { answer: answer, isCorrect: false };

    // Update the UI
    currentProblemIndex++;
    questionDisplayEl.textContent = question;
    problemCounterEl.textContent = `${currentProblemIndex}/${TOTAL_PROBLEMS}`;
    answerInputEl.value = '';
    answerInputEl.focus();
    feedbackEl.textContent = '';
}

function handleAnswer(e) {
    e.preventDefault();

    const userAnswer = parseInt(answerInputEl.value);

    if (isNaN(userAnswer)) {
        feedbackEl.textContent = 'Please enter a number.';
        return;
    }

    if (userAnswer === currentProblem.answer) {
        correctCount++;
        feedbackEl.textContent = 'Correct!';
    } else {
        feedbackEl.textContent = `Incorrect! Answer was ${currentProblem.answer}.`;
    }

    // Delay before setting up the next problem
    setTimeout(setupNewProblem, 500);
}

function finishGame() {
    stopTimer();
    const finalTime = (Date.now() - startTime) / 1000;
    
    // Display results
    finalCorrectEl.textContent = correctCount;
    finalTimeEl.textContent = finalTime.toFixed(2) + 's';
    
    // Switch views
    gameAreaEl.classList.add('d-none');
    resultsAreaEl.classList.remove('d-none');
}

function startGame() {
    // Reset state
    currentProblemIndex = 0;
    correctCount = 0;
    
    // Reset UI visibility
    gameAreaEl.classList.remove('d-none');
    resultsAreaEl.classList.add('d-none');
    startButtonEl.classList.add('d-none');
    answerFormEl.classList.remove('d-none');
    
    // Start game
    startTimer();
    setupNewProblem();
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    gameAreaEl = document.getElementById('game-area');
    resultsAreaEl = document.getElementById('results-area');
    startButtonEl = document.getElementById('start-button');
    restartButtonEl = document.getElementById('restart-button');
    answerFormEl = document.getElementById('answer-form');
    answerInputEl = document.getElementById('answer-input');
    timerDisplayEl = document.getElementById('timer-display');
    problemCounterEl = document.getElementById('problem-counter');
    questionDisplayEl = document.getElementById('question-display');
    feedbackEl = document.getElementById('feedback');
    finalCorrectEl = document.getElementById('final-correct');
    finalTimeEl = document.getElementById('final-time');

    // 2. Attach listeners
    if (startButtonEl) startButtonEl.addEventListener('click', startGame);
    if (restartButtonEl) restartButtonEl.addEventListener('click', startGame);
    if (answerFormEl) answerFormEl.addEventListener('submit', handleAnswer);
    
    // Initial display setup
    answerFormEl.classList.add('d-none');
    resultsAreaEl.classList.add('d-none');
    startButtonEl.classList.remove('d-none');
}

export function cleanup() {
    // Stop any running timer
    stopTimer();
    
    // Remove listeners
    if (startButtonEl) startButtonEl.removeEventListener('click', startGame);
    if (restartButtonEl) restartButtonEl.removeEventListener('click', startGame);
    if (answerFormEl) answerFormEl.removeEventListener('submit', handleAnswer);
}