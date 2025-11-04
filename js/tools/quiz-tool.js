// js/tools/quiz-tool.js

// API Configuration
const API_URL = 'https://opentdb.com/api.php?amount=10&category=9&type=multiple'; // 10 General Knowledge questions

// Quiz State
let allQuestions = []; // Stores the API data
let currentQuestionIndex = 0;
let score = 0;
let answerSelected = false;

// DOM Elements
let quizContentEl, resultsAreaEl, questionTextEl, optionsContainerEl, feedbackEl, nextButtonEl, finalScoreEl, restartButtonEl;

// --- Utility Functions ---

/**
 * Decodes HTML entities (like &amp; or &quot;) from the API response.
 */
function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

/**
 * Shuffles an array (Fisher-Yates algorithm).
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- API & Initialization ---

/**
 * Fetches questions from the Open Trivia Database API.
 */
async function fetchQuestions() {
    quizContentEl.classList.add('d-none');
    feedbackEl.textContent = 'Loading questions...';
    nextButtonEl.disabled = true;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.response_code !== 0) {
             throw new Error("API returned an error code. Could not fetch questions.");
        }
        
        allQuestions = data.results;
        
        if (allQuestions.length === 0) {
            throw new Error("API returned no questions.");
        }

        // Start the quiz once data is ready
        restartQuiz();
        
    } catch (error) {
        console.error("Quiz Fetch Error:", error);
        questionTextEl.textContent = "Error loading quiz data. Please try again.";
        feedbackEl.textContent = "Initialization failed. Check console for details.";
    }
}


// --- Core Quiz Logic ---

/**
 * Loads and displays the current question.
 */
function loadQuestion() {
    // Reset state for new question
    answerSelected = false;
    optionsContainerEl.innerHTML = '';
    
    nextButtonEl.textContent = (currentQuestionIndex === allQuestions.length - 1) ? "Finish Quiz" : "Next Question »";
    nextButtonEl.disabled = true;

    const currentQ = allQuestions[currentQuestionIndex];
    
    // Combine all options (correct + incorrect) and decode
    let options = currentQ.incorrect_answers.map(decodeHtml);
    const correctAnswer = decodeHtml(currentQ.correct_answer);
    options.push(correctAnswer);
    
    // Shuffle the combined options array
    options = shuffleArray(options);

    questionTextEl.textContent = decodeHtml(currentQ.question);
    feedbackEl.textContent = `Question ${currentQuestionIndex + 1} of ${allQuestions.length}`;

    // Create buttons for each option
    options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('list-group-item', 'list-group-item-action', 'text-start');
        button.textContent = option;
        button.dataset.option = option;
        button.addEventListener('click', handleAnswerSelection);
        optionsContainerEl.appendChild(button);
    });
}

/**
 * Handles a user clicking an option button.
 */
function handleAnswerSelection(e) {
    if (answerSelected) return;

    answerSelected = true;
    nextButtonEl.disabled = false;
    const selectedOption = e.target.dataset.option;
    const correctAnswer = decodeHtml(allQuestions[currentQuestionIndex].correct_answer);

    // Check if the answer is correct
    if (selectedOption === correctAnswer) {
        score++;
        feedbackEl.textContent = "Correct! ✅";
        e.target.classList.add('list-group-item-success');
    } else {
        feedbackEl.textContent = "Incorrect. ❌";
        e.target.classList.add('list-group-item-danger');
    }

    // Highlight the correct answer (and disable clicks)
    document.querySelectorAll('.list-group-item').forEach(btn => {
        btn.removeEventListener('click', handleAnswerSelection);
        if (btn.dataset.option === correctAnswer) {
            btn.classList.add('list-group-item-success');
        }
    });
}

/**
 * Moves to the next question or finishes the quiz.
 */
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < allQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

/**
 * Displays the final score and results area.
 */
function showResults() {
    quizContentEl.classList.add('d-none');
    resultsAreaEl.classList.remove('d-none');
    
    const totalQuestions = allQuestions.length;
    finalScoreEl.textContent = `${score} / ${totalQuestions}`;
}

/**
 * Resets the quiz state and starts the game over.
 */
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    quizContentEl.classList.remove('d-none');
    resultsAreaEl.classList.add('d-none');
    loadQuestion();
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    quizContentEl = document.getElementById('quiz-content');
    resultsAreaEl = document.getElementById('results-area');
    questionTextEl = document.getElementById('question-text');
    optionsContainerEl = document.getElementById('options-container');
    feedbackEl = document.getElementById('feedback');
    nextButtonEl = document.getElementById('next-button');
    finalScoreEl = document.getElementById('final-score');
    restartButtonEl = document.getElementById('restart-button');

    // 2. Attach listeners
    if (nextButtonEl) nextButtonEl.addEventListener('click', nextQuestion);
    if (restartButtonEl) restartButtonEl.addEventListener('click', fetchQuestions); // Call fetch to reload
    
    // 3. Kick off the process by fetching the questions
    fetchQuestions();
}

export function cleanup() {
    // Remove listeners
    if (nextButtonEl) nextButtonEl.removeEventListener('click', nextQuestion);
    if (restartButtonEl) restartButtonEl.removeEventListener('click', fetchQuestions);
    
    // Remove listeners from any existing options buttons
    document.querySelectorAll('.list-group-item').forEach(btn => {
        btn.removeEventListener('click', handleAnswerSelection);
    });
}