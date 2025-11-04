// js/tools/would-you-rather.js

// DOM Elements
let option1Btn, option2Btn, nextBtn, questionContainer, resultContainer, resultText;

const QUESTIONS = [
    ["Be able to fly", "Be able to turn invisible"],
    ["Have unlimited money", "Have unlimited time"],
    ["Live in the past", "Live in the future"],
    ["Control fire", "Control water"],
    ["Talk to animals", "Speak all human languages"],
    ["Never have to sleep", "Never have to eat"],
    ["Have a personal chef", "Have a personal driver"],
    ["Be able to teleport anywhere", "Be able to read minds"],
    ["Give up social media for a year", "Give up watching movies for a year"],
    ["Always be 10 minutes late", "Always be 20 minutes early"],
    ["Have a photographic memory", "Be able to forget anything you want"],
    ["Live without music", "Live without television"],
];

function showNewQuestion() {
    const randomIndex = Math.floor(Math.random() * QUESTIONS.length);
    const [option1, option2] = QUESTIONS[randomIndex];

    option1Btn.textContent = option1;
    option2Btn.textContent = option2;

    questionContainer.classList.remove('d-none');
    resultContainer.classList.add('d-none');
    option1Btn.disabled = false;
    option2Btn.disabled = false;
}

function handleChoice(event) {
    const chosenOption = event.target.textContent;
    resultText.textContent = `You chose: "${chosenOption}". Interesting!`;

    questionContainer.classList.add('d-none');
    resultContainer.classList.remove('d-none');
    option1Btn.disabled = true;
    option2Btn.disabled = true;
}

export function init() {
    option1Btn = document.getElementById('wyr-option-1');
    option2Btn = document.getElementById('wyr-option-2');
    nextBtn = document.getElementById('wyr-next-btn');
    questionContainer = document.getElementById('wyr-question-container');
    resultContainer = document.getElementById('wyr-result-container');
    resultText = document.getElementById('wyr-result-text');

    option1Btn.addEventListener('click', handleChoice);
    option2Btn.addEventListener('click', handleChoice);
    nextBtn.addEventListener('click', showNewQuestion);

    showNewQuestion();
}

export function cleanup() {
    option1Btn?.removeEventListener('click', handleChoice);
    option2Btn?.removeEventListener('click', handleChoice);
    nextBtn?.removeEventListener('click', showNewQuestion);
}