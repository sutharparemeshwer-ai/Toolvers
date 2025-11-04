// js/tools/this-or-that-superhero.js

// DOM Elements
let option1Btn, option2Btn, playAgainBtn, questionContainer, resultContainer, resultText, opponentResultText, questionTitle, progressText;

// Game State
let currentQuestionIndex = 0;
let userTeam = [];
let opponentTeam = [];
let shuffledQuestions = [];

// Original set of questions
const ORIGINAL_QUESTIONS = [
    ["Superman", "Batman"],
    ["Spider-Man", "Iron Man"],
    ["Wonder Woman", "Captain Marvel"],
    ["Thor", "Hulk"],
    ["Wolverine", "Deadpool"],
    ["Black Panther", "Captain America"],
    ["Doctor Strange", "Scarlet Witch"],
    ["The Flash", "Quicksilver"],
    ["Green Lantern", "Nova"],
    ["Aquaman", "Namor"],
    ["Professor X", "Magneto"],
    ["Thanos", "Darkseid"],
];

/**
 * Shuffles an array in place.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showQuestion() {
    // Check if all questions have been answered
    if (currentQuestionIndex >= shuffledQuestions.length) {
        showFinalResult();
        return;
    }

    const [option1, option2] = shuffledQuestions[currentQuestionIndex];

    option1Btn.textContent = option1;
    option2Btn.textContent = option2;
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${shuffledQuestions.length}`;

    questionContainer.classList.remove('d-none');
    resultContainer.classList.add('d-none');
}

function handleChoice(event) {
    const chosenOption = event.target.textContent;
    userTeam.push(chosenOption); // Add choice to the team

    // Find the opponent and add them to the opponent team
    const [option1, option2] = shuffledQuestions[currentQuestionIndex];
    const opponent = (chosenOption === option1) ? option2 : option1;
    opponentTeam.push(opponent);

    currentQuestionIndex++; // Move to the next question
    showQuestion();
}

function showFinalResult() {
    questionTitle.textContent = "The Final Teams!";
    
    // Create badges for the user's chosen team
    const teamHtml = userTeam.map(hero => `<span class="badge bg-success fs-5 m-1">${hero}</span>`).join('');
    resultText.innerHTML = `<h5>Your Team</h5><div class="d-flex flex-wrap justify-content-center">${teamHtml}</div>`;

    // Create badges for the opponent team
    const opponentTeamHtml = opponentTeam.map(hero => `<span class="badge bg-danger fs-5 m-1">${hero}</span>`).join('');
    opponentResultText.innerHTML = `<h5 class="mt-4">Opponent Team</h5><div class="d-flex flex-wrap justify-content-center">${opponentTeamHtml}</div>`;

    questionContainer.classList.add('d-none');
    resultContainer.classList.remove('d-none');
}

function startGame() {
    currentQuestionIndex = 0;
    userTeam = [];
    opponentTeam = [];
    shuffledQuestions = [...ORIGINAL_QUESTIONS]; // Create a copy
    shuffleArray(shuffledQuestions);

    questionTitle.textContent = "Who would you rather have on your team?";
    showQuestion();
}

export function init() {
    option1Btn = document.getElementById('superhero-option-1');
    option2Btn = document.getElementById('superhero-option-2');
    playAgainBtn = document.getElementById('superhero-play-again-btn');
    questionContainer = document.getElementById('superhero-question-container');
    resultContainer = document.getElementById('superhero-result-container');
    resultText = document.getElementById('superhero-result-text');
    opponentResultText = document.getElementById('superhero-opponent-result-text');
    questionTitle = document.getElementById('superhero-question-title');
    progressText = document.getElementById('superhero-progress-text');

    option1Btn.addEventListener('click', handleChoice);
    option2Btn.addEventListener('click', handleChoice);
    playAgainBtn.addEventListener('click', startGame);

    startGame();
}

export function cleanup() {
    option1Btn?.removeEventListener('click', handleChoice);
    option2Btn?.removeEventListener('click', handleChoice);
    playAgainBtn?.removeEventListener('click', startGame);
}