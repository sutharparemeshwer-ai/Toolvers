// js/tools/email-writer.js

// --- Configuration (Copied from other AI tools) ---
const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ";
const MODEL_NAME = "gemini-2.5-flash";

// --- DOM Elements ---
let inputEl, outputEl, outputContainer, modeContainer, submitBtn, statusEl;

/**
 * Generates a prompt for the AI based on the selected mode and input text.
 * @param {string} mode - The selected mode ('correct', 'professional', 'casual', 'write').
 * @param {string} text - The user's input text.
 * @returns {string} The constructed prompt for the AI.
 */
function getAIPrompt(mode, text) {
  switch (mode) {
    case "correct":
      return `Correct the grammar and spelling of the following text. Only return the corrected text, without any commentary.\n\nText:\n---\n${text}\n---\n\nCorrected Text:`;
    case "professional":
      return `Rewrite the following text to sound more professional and formal. Only return the rewritten text.\n\nOriginal Text:\n---\n${text}\n---\n\nProfessional Version:`;
    case "casual":
      return `Rewrite the following text to sound more casual and friendly. Only return the rewritten text.\n\nOriginal Text:\n---\n${text}\n---\n\nCasual Version:`;
    case "write":
      return `Write a short, clear, and effective email based on the following request. Only return the complete email content (subject and body).\n\nRequest:\n---\n${text}\n---\n\nGenerated Email:`;
    default:
      return text;
  }
}

/**
 * Calls the Google Gemini API to process the text.
 * @param {string} prompt - The full prompt to send to the AI.
 * @returns {Promise<string>} A promise that resolves with the AI's response.
 */
async function generateWithAI(prompt) {
  if (API_KEY === "YOUR_API_KEY") {
    return Promise.reject(
      "Please add your Google Gemini API key to 'js/tools/email-writer.js' to use this tool."
    );
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message || "The AI service failed to respond."
    );
  }

  const data = await response.json();
  try {
    return data.candidates[0].content.parts[0].text.trim();
  } catch (e) {
    throw new Error("Could not understand the AI's response format.");
  }
}

async function handleSubmit() {
  const selectedMode = modeContainer.querySelector(
    'input[name="email-mode"]:checked'
  ).value;
  const inputText = inputEl.value.trim();

  if (!inputText) {
    statusEl.textContent = "Please enter some text or a prompt.";
    statusEl.className = "text-center small text-danger mt-2";
    return;
  }

  // UI updates for loading state
  submitBtn.disabled = true;
  outputEl.value = "";
  statusEl.textContent = "Generating with AI...";
  statusEl.className = "text-center small text-muted mt-2";
  outputContainer.classList.remove("d-none");

  try {
    const prompt = getAIPrompt(selectedMode, inputText);
    const resultText = await generateWithAI(prompt);
    outputEl.value = resultText;
    statusEl.textContent = "Generation complete!";
    statusEl.className = "text-center small text-success mt-2";
  } catch (error) {
    outputEl.value = `Sorry, an error occurred: ${error.message}`;
    statusEl.textContent = "An error occurred.";
    statusEl.className = "text-center small text-danger mt-2";
  } finally {
    submitBtn.disabled = false;
  }
}

function handleModeChange(event) {
  const mode = event.target.value;
  if (mode === "write") {
    inputEl.placeholder =
      "e.g., Ask my team for a project status update for Friday.";
  } else {
    inputEl.placeholder = "Paste your draft here...";
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  inputEl = document.getElementById("email-writer-input");
  outputEl = document.getElementById("email-writer-output");
  outputContainer = document.getElementById("email-writer-output-container");
  modeContainer = document.getElementById("email-writer-mode");
  submitBtn = document.getElementById("email-writer-submit-btn");
  statusEl = document.getElementById("email-writer-status");

  // Check for API Key
  if (API_KEY === "YOUR_API_KEY") {
    statusEl.textContent =
      "Warning: API key is not set in js/tools/email-writer.js";
    statusEl.className = "text-center small text-danger mt-2";
    submitBtn.disabled = true;
  }

  // Attach event listeners
  submitBtn.addEventListener("click", handleSubmit);
  modeContainer.addEventListener("change", handleModeChange);
}

export function cleanup() {
  submitBtn.removeEventListener("click", handleSubmit);
  modeContainer.removeEventListener("change", handleModeChange);
}
