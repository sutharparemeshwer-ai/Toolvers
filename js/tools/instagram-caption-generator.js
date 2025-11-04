// js/tools/instagram-caption-generator.js

// --- Configuration (Copied from AI Chat Assistant) ---
const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ";
const MODEL_NAME = "gemini-2.5-flash";

// --- DOM Elements ---
let descriptionInput,
  generateBtn,
  statusEl,
  resultsContainer,
  captionOutput,
  hashtagsOutput;

/**
 * Calls the Google Gemini API to generate content.
 * @param {string} description The user's description of their post.
 * @returns {Promise<string>} A promise that resolves with the AI's response.
 */
async function generateWithAI(description) {
  if (API_KEY === "YOUR_API_KEY") {
    return Promise.reject(
      "Please add your Google Gemini API key to 'js/tools/instagram-caption-generator.js' to use this tool."
    );
  }

  // Construct a clear, structured prompt for the AI
  const prompt = `
    Generate an engaging Instagram caption and a list of relevant hashtags for the following post description.

    Post Description: "${description}"

    Please format your response exactly as follows, with no extra text or explanations:
    CAPTION:
    [Your generated caption here]

    HASHTAGS:
    [A list of 10-15 relevant hashtags, separated by spaces, starting with #]
  `;

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
    const aiResponseText = data.candidates[0].content.parts[0].text;
    return aiResponseText.trim();
  } catch (e) {
    console.error("Error parsing AI response:", data);
    throw new Error("Could not understand the AI's response format.");
  }
}

async function handleSubmit() {
  const description = descriptionInput.value.trim();
  if (!description) {
    alert("Please describe your post first.");
    return;
  }

  // UI updates for loading state
  generateBtn.disabled = true;
  statusEl.textContent = "Generating content with AI...";
  resultsContainer.classList.add("d-none");

  try {
    const rawResponse = await generateWithAI(description);

    // Parse the structured response
    const captionMatch = rawResponse.match(/CAPTION:\s*([\s\S]*?)\s*HASHTAGS:/);
    const hashtagsMatch = rawResponse.match(/HASHTAGS:\s*([\s\S]*)/);

    const caption = captionMatch
      ? captionMatch[1].trim()
      : "Could not generate caption.";
    const hashtags = hashtagsMatch
      ? hashtagsMatch[1].trim()
      : "Could not generate hashtags.";

    captionOutput.value = caption;
    hashtagsOutput.value = hashtags;

    resultsContainer.classList.remove("d-none");
    statusEl.textContent = "";
  } catch (error) {
    console.error("Generation Error:", error);
    statusEl.textContent = `An error occurred: ${error.message}`;
  } finally {
    generateBtn.disabled = false;
  }
}

function handleCopy(event) {
  const targetId = event.currentTarget.dataset.target;
  const textElement = document.getElementById(targetId);
  if (textElement) {
    textElement.select();
    navigator.clipboard
      .writeText(textElement.value)
      .then(() => alert("Copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err));
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  descriptionInput = document.getElementById("post-description");
  generateBtn = document.getElementById("generate-caption-btn");
  statusEl = document.getElementById("ai-status");
  resultsContainer = document.getElementById("results-container");
  captionOutput = document.getElementById("generated-caption");
  hashtagsOutput = document.getElementById("generated-hashtags");

  // Check for API Key
  if (API_KEY === "YOUR_API_KEY") {
    statusEl.textContent =
      "Warning: API key is not set in js/tools/instagram-caption-generator.js";
    generateBtn.disabled = true;
  }

  // Attach event listeners
  generateBtn.addEventListener("click", handleSubmit);
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", handleCopy);
  });
}

export function cleanup() {
  // Remove event listeners
  generateBtn.removeEventListener("click", handleSubmit);
}
