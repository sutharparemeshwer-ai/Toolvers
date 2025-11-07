// js/tools/ai-code-explainer.js

// --- DOM Elements ---
let codeInput, languageSelect, explainBtn;
let outputContainer,
  statusEl,
  explanationEl,
  optimizationContainer,
  optimizationEl,
  copyBtn,
  codeSnippetTextEl;

// --- AI Configuration ---
const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ"; // Using the key from your other AI tools
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Calls the Google Gemini API to get an explanation and optimizations for a code snippet.
 * @param {string} code - The code snippet to analyze.
 * @param {string} language - The programming language (for the prompt).
 * @returns {Promise<{explanation: string, optimizations: string}>} An object with the explanation and optimizations.
 */
async function generateWithAI(code, language) {
  if (API_KEY === "YOUR_API_KEY") {
    return Promise.reject(
      "Please add your Google Gemini API key to 'js/tools/ai-code-explainer.js'"
    );
  }

  const prompt = `
        You are an expert code explainer. Analyze the following ${language} code snippet.
        Provide a clear, step-by-step explanation of what the code does.
        Also, provide a list of potential optimizations or best-practice suggestions.

        Format your response exactly like this, with no extra text or introductions:

        EXPLANATION:
        [Your detailed, step-by-step explanation here. Use HTML <ul> and <li> for lists.]

        OPTIMIZATIONS:
        [Your list of optimization suggestions here. Use HTML <ul> and <li>. If no suggestions, write "No specific optimizations found.".]

        Code Snippet:
        \`\`\`${language}
        ${code}
        \`\`\`
    `;

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
    const aiResponseText = data.candidates[0].content.parts[0].text;
    const explanationMatch = aiResponseText.match(
      /EXPLANATION:\s*([\s\S]*?)\s*OPTIMIZATIONS:/
    );
    const optimizationsMatch = aiResponseText.match(
      /OPTIMIZATIONS:\s*([\s\S]*)/
    );
    const codeSnippetMatch = aiResponseText.match(
      /Code Snippet:\s*```[a-zA-Z]*\n([\s\S]*?)```/
    );

    const explanation = explanationMatch
      ? explanationMatch[1].trim()
      : "AI could not generate an explanation.";
    const optimizations = optimizationsMatch
      ? optimizationsMatch[1].trim()
      : "AI could not generate optimizations.";
    const codeSnippet = codeSnippetMatch ? codeSnippetMatch[1].trim() : code; // Fallback to original code

    return { explanation, optimizations };
  } catch (e) {
    throw new Error("Could not understand the AI's response format.");
  }
}

function handleCopyExplanation() {
  // Use innerText to get the text content without HTML tags
  navigator.clipboard.writeText(explanationEl.innerText).then(() => {
    copyBtn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fa-solid fa-copy me-1"></i> Copy';
    }, 2000);
  });
}

async function handleExplainClick() {
  const code = codeInput.value.trim();
  const language = languageSelect.value;

  if (!code) {
    alert("Please paste some code into the text area first.");
    return;
  }

  // Check for API Key
  if (API_KEY === "YOUR_API_KEY") {
    statusEl.innerHTML =
      "Warning: API key is not set in `js/tools/ai-code-explainer.js`.";
    statusEl.className = "text-danger text-center pt-5";
    return;
  }

  statusEl.innerHTML = `
    <div class="d-flex justify-content-center align-items-center pt-5">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-3 text-light">AI is thinking...</span>
    </div>`;
  explanationEl.innerHTML = "";
  optimizationEl.innerHTML = "";
  optimizationContainer.classList.add("d-none");
  copyBtn.classList.add("d-none");
  explainBtn.disabled = true;

  try {
    const { explanation, optimizations } = await generateWithAI(code, language);
    explanationEl.innerHTML = explanation; // Use innerHTML as AI response contains HTML tags
    if (
      optimizations &&
      optimizations.toLowerCase() !== "no specific optimizations found."
    ) {
      optimizationEl.innerHTML = optimizations;
      optimizationContainer.classList.remove("d-none");
    }

    // Display the original code in the code snippet tab
    codeSnippetTextEl.textContent = code;
    codeSnippetTextEl.className = `language-${language.toLowerCase()}`; // For syntax highlighting

    statusEl.textContent = "";
    copyBtn.classList.remove("d-none");
  } catch (error) {
    statusEl.innerHTML = `<span class="text-danger">Error: ${error.message}</span>`;
  } finally {
    explainBtn.disabled = false;
  }
}

export function init() {
  codeInput = document.getElementById("code-input-textarea");
  languageSelect = document.getElementById("code-language-select");
  explainBtn = document.getElementById("explain-code-btn");
  outputContainer = document.getElementById("explanation-output-container");
  statusEl = document.getElementById("explanation-status");
  explanationEl = document.getElementById("explanation-text");
  optimizationContainer = document.getElementById("optimization-container");
  optimizationEl = document.getElementById("optimization-text");
  copyBtn = document.getElementById("copy-explanation-btn");
  codeSnippetTextEl = document.getElementById("code-snippet-text");

  explainBtn.addEventListener("click", handleExplainClick);
  copyBtn.addEventListener("click", handleCopyExplanation);
}

export function cleanup() {
  if (explainBtn) explainBtn.removeEventListener("click", handleExplainClick);
  if (copyBtn) copyBtn.removeEventListener("click", handleCopyExplanation);
}
