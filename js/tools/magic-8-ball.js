// js/tools/magic-8-ball.js

// DOM Elements
let ballEl, answerEl, shakeBtn, questionInput;

const ANSWERS = [
  // Positive
  "It is certain.",
  "It is decidedly so.",
  "Without a doubt.",
  "Yes – definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",
  // Non-committal
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",
  // Negative
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful.",
];

function shakeBall() {
  if (!questionInput.value.trim()) {
    alert("Please ask a question first!");
    return;
  }

  // 1. Add shake animation
  ballEl.classList.add("shake");
  answerEl.textContent = ""; // Hide answer during shake

  // 2. Wait for the animation to finish
  setTimeout(() => {
    // 3. Remove animation class
    ballEl.classList.remove("shake");

    // 4. Get and display a random answer
    const randomIndex = Math.floor(Math.random() * ANSWERS.length);
    answerEl.textContent = ANSWERS[randomIndex];
  }, 1000); // Match the duration of the CSS animation
}

export function init() {
  ballEl = document.getElementById("m8-ball");
  answerEl = document.getElementById("m8-answer");
  shakeBtn = document.getElementById("m8-shake-btn");
  questionInput = document.getElementById("m8-question-input");

  shakeBtn.addEventListener("click", shakeBall);
  questionInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      shakeBall();
    }
  });
}

export function cleanup() {
  shakeBtn?.removeEventListener("click", shakeBall);
}
