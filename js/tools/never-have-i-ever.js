// js/tools/never-have-i-ever.js

// --- DOM Elements ---
let newPromptBtn, promptTextEl, categoryLabelEl;
let categoryBtns;

// --- Game State ---
let currentCategory = "clean";
let lastPrompt = "";

const PROMPTS = {
  clean: [
    "eaten a whole pizza by myself.",
    "pretended to be on the phone to avoid talking to someone.",
    "binge-watched an entire TV series in one weekend.",
    "laughed so hard I cried.",
    "stalked someone's social media profile from years ago.",
    "used the '5-second rule' for food that fell on the floor.",
    "forgotten someone's name right after they told me.",
    "lied about my age.",
    "re-gifted a present.",
    "sung karaoke.",
  ],
  party: [
    "sent a text to the wrong person.",
    "had a crush on a friend's partner.",
    "lied on a resume.",
    "snuck into a movie theater.",
    "been in a physical fight.",
    "ghosted someone.",
    "used a fake ID.",
    "crashed a party.",
    "dined and dashed.",
    "lied to get out of a date.",
  ],
};

function showNewPrompt() {
  const availablePrompts = PROMPTS[currentCategory];
  let newPrompt;

  // Ensure we don't show the same prompt twice in a row
  do {
    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    newPrompt = availablePrompts[randomIndex];
  } while (newPrompt === lastPrompt && availablePrompts.length > 1);

  lastPrompt = newPrompt;
  promptTextEl.textContent = `Never have I ever ${newPrompt}`;
}

function handleCategoryChange(e) {
  e.preventDefault();
  const newCategory = e.target.dataset.category;
  if (newCategory) {
    currentCategory = newCategory;
    categoryLabelEl.textContent =
      newCategory.charAt(0).toUpperCase() + newCategory.slice(1);
    showNewPrompt();
  }
}

export function init() {
  newPromptBtn = document.getElementById("new-nhie-prompt-btn");
  promptTextEl = document.getElementById("nhie-prompt-text");
  categoryLabelEl = document.getElementById("nhie-category-label");
  categoryBtns = document.querySelectorAll(".nhie-category-btn");

  newPromptBtn.addEventListener("click", showNewPrompt);
  categoryBtns.forEach((btn) =>
    btn.addEventListener("click", handleCategoryChange)
  );
}

export function cleanup() {
  newPromptBtn?.removeEventListener("click", showNewPrompt);
  categoryBtns.forEach((btn) =>
    btn.removeEventListener("click", handleCategoryChange)
  );
}
