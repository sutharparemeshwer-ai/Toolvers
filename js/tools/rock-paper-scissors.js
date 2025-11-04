// js/tools/rock-paper-scissors.js

const CHOICES = ["rock", "paper", "scissors"];
const CHOICE_EMOJIS = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️"
};

// Score tracking
let playerScore = 0;
let computerScore = 0;

// DOM Elements
let choiceBtns, 
    playerChoiceDisplay, computerChoiceDisplay, 
    resultMessageEl, playerScoreEl, computerScoreEl;


// --- Core Game Logic ---

/**
 * Generates a random choice for the computer.
 */
function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * CHOICES.length);
    return CHOICES[randomIndex];
}

/**
 * Determines the winner of the round.
 * @param {string} playerChoice 
 * @param {string} computerChoice 
 * @returns {string} 'win', 'lose', or 'draw'
 */
function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return "draw";
    }
    
    // Winning conditions for the player
    if (
        (playerChoice === "rock" && computerChoice === "scissors") ||
        (playerChoice === "paper" && computerChoice === "rock") ||
        (playerChoice === "scissors" && computerChoice === "paper")
    ) {
        return "win";
    }
    
    // Otherwise, the computer wins
    return "lose";
}

/**
 * Updates the score and message based on the round result.
 */
function updateGame(result) {
    resultMessageEl.classList.remove('text-success', 'text-danger', 'text-warning');
    
    if (result === 'win') {
        playerScore++;
        resultMessageEl.textContent = "You Win! 🎉";
        resultMessageEl.classList.add('text-success');
    } else if (result === 'lose') {
        computerScore++;
        resultMessageEl.textContent = "You Lose! 😔";
        resultMessageEl.classList.add('text-danger');
    } else {
        resultMessageEl.textContent = "It's a Draw! 🤝";
        resultMessageEl.classList.add('text-warning');
    }

    // Update score displays
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
}

/**
 * Handles the main action when a player clicks a choice button.
 */
function handlePlayerChoice(e) {
    const playerChoice = e.currentTarget.dataset.choice;
    const computerChoice = getComputerChoice();
    
    // 1. Display the choices
    playerChoiceDisplay.textContent = CHOICE_EMOJIS[playerChoice];
    computerChoiceDisplay.textContent = CHOICE_EMOJIS[computerChoice];
    
    // 2. Determine the winner
    const result = determineWinner(playerChoice, computerChoice);
    
    // 3. Update the game state (score and message)
    updateGame(result);
}


// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    choiceBtns = document.querySelectorAll('.choice-btn');
    playerChoiceDisplay = document.getElementById('player-choice-display');
    computerChoiceDisplay = document.getElementById('computer-choice-display');
    resultMessageEl = document.getElementById('result-message');
    playerScoreEl = document.getElementById('player-score');
    computerScoreEl = document.getElementById('computer-score');

    // 2. Attach listeners
    choiceBtns.forEach(button => {
        button.addEventListener('click', handlePlayerChoice);
    });

    // 3. Reset scores on load (in case cleanup wasn't perfect)
    playerScore = 0;
    computerScore = 0;
    playerScoreEl.textContent = '0';
    computerScoreEl.textContent = '0';
    resultMessageEl.textContent = "Make your move!";
    playerChoiceDisplay.textContent = "?";
    computerChoiceDisplay.textContent = "?";
}

export function cleanup() {
    // Remove listeners
    choiceBtns.forEach(button => {
        button.removeEventListener('click', handlePlayerChoice);
    });
    
    // Reset state variables
    playerScore = 0;
    computerScore = 0;
}