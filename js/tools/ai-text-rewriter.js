// js/tools/ai-text-rewriter.js

// --- Configuration (Copied from AI Chat Assistant) ---
const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ";
const MODEL_NAME = "gemini-2.5-flash";

// --- DOM Elements ---
let originalTextEl, rewrittenTextEl, toneSelectEl, submitBtn, statusEl;

/**
 * Calls the Google Gemini API to rewrite text.
 * @param {string} text The original text to rewrite.
 * @param {string} tone The desired tone for the rewritten text.
 * @returns {Promise<string>} A promise that resolves with the rewritten text.
 */
async function rewriteTextWithAI(text, tone) {
  if (API_KEY === "YOUR_API_KEY") {
    return Promise.reject(
      "Please add your Google Gemini API key to 'js/tools/ai-text-rewriter.js' to use this tool."
    );
  }

  // Construct a clear prompt for the AI
  const prompt = `Rewrite the following text to make it more "${tone}". Only return the rewritten text, without any additional commentary or introduction.

Original Text:
---
${text}
---

Rewritten Text:`;

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error:", errorData);
    throw new Error(
      errorData.error?.message || "The AI service failed to respond."
    );
  }

  const data = await response.json();

  try {
    const rewrittenText = data.candidates[0].content.parts[0].text;
    return rewrittenText.trim();
  } catch (e) {
    console.error("Error parsing AI response:", data);
    throw new Error("Could not understand the AI's response format.");
  }
}

async function handleSubmit() {
  const originalText = originalTextEl.value.trim();
  const selectedTone = toneSelectEl.options[toneSelectEl.selectedIndex].text;

  if (!originalText) {
    statusEl.textContent = "Please enter some text to rewrite.";
    statusEl.className = "text-center small text-danger mt-3";
    return;
  }

  // UI updates for loading state
  submitBtn.disabled = true;
  rewrittenTextEl.value = "";
  statusEl.textContent = "Rewriting with AI...";
  statusEl.className = "text-center small text-muted mt-3";

  try {
    const rewrittenText = await rewriteTextWithAI(originalText, selectedTone);
    rewrittenTextEl.value = rewrittenText;
    statusEl.textContent = "Rewrite complete!";
    statusEl.className = "text-center small text-success mt-3";
  } catch (error) {
    console.error("Rewrite Error:", error);
    rewrittenTextEl.value = `Sorry, an error occurred: ${error.message}`;
    statusEl.textContent = "An error occurred.";
    statusEl.className = "text-center small text-danger mt-3";
  } finally {
    submitBtn.disabled = false;
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  originalTextEl = document.getElementById("rewriter-original-text");
  rewrittenTextEl = document.getElementById("rewriter-rewritten-text");
  toneSelectEl = document.getElementById("rewriter-tone-select");
  submitBtn = document.getElementById("rewriter-submit-btn");
  statusEl = document.getElementById("rewriter-status");

  // Check for API Key
  if (API_KEY === "YOUR_API_KEY") {
    statusEl.textContent =
      "Warning: API key is not set in js/tools/ai-text-rewriter.js";
    statusEl.className = "text-center small text-danger mt-3";
    submitBtn.disabled = true;
  }

  // Attach event listeners
  submitBtn.addEventListener("click", handleSubmit);
}

export function cleanup() {
  // Remove event listeners
  submitBtn.removeEventListener("click", handleSubmit);
}
