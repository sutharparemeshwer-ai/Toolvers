// js/tools/ai-code-explainer.js

// --- DOM Elements ---
let codeInput, languageSelect, explainBtn;
let outputContainer, statusEl, explanationEl, optimizationContainer, optimizationEl, copyBtn;


/**
 * "AI" logic to generate a plain English explanation of a code snippet.
 * This is a simplified simulation using regex and keyword matching.
 * @param {string} code - The code snippet to analyze.
 * @param {string} language - The programming language.
 * @returns {string} The generated explanation.
 */
function generateExplanation(code, language) {
  let explanation = `This appears to be a <strong>${language}</strong> code snippet. Here's a breakdown:\n\n`;
  const lines = code.split("\n").filter((line) => line.trim() !== "");
  let findings = [];

  // --- Pattern Recognition ---

  // Function definitions
  const funcRegex = /(function\s+(\w+)|const\s+(\w+)\s*=\s*\(|def\s+(\w+))/;
  const funcs = code.match(new RegExp(funcRegex, "g")) || [];
  if (funcs.length > 0) {
    const funcName =
      (code.match(funcRegex) || [])[2] ||
      (code.match(funcRegex) || [])[3] ||
      (code.match(funcRegex) || [])[4];
    findings.push(
      `It defines a function${
        funcName ? ` named <strong>${funcName}</strong>` : ""
      }. Functions are reusable blocks of code that perform a specific task.`
    );
  }

  // Loops
  if (/\b(for|while|forEach)\b/.test(code)) {
    findings.push(
      "It contains a <strong>loop</strong>, which is used to repeat a block of code multiple times."
    );
  }

  // Conditionals
  if (/\b(if|else|switch|case)\b/.test(code)) {
    findings.push(
      'It uses <strong>conditional logic</strong> (like an "if" statement) to make decisions and execute different code paths based on certain conditions.'
    );
  }

  // Variable declarations
  if (/\b(const|let|var|int|String|final)\b/.test(code)) {
    findings.push(
      "It declares one or more <strong>variables</strong> to store data, such as numbers, text, or objects."
    );
  }

  // API calls (simple check)
  if (/\b(fetch|axios.get|axios.post)\b/.test(code)) {
    findings.push(
      "It seems to make a <strong>network request</strong> to an API to fetch or send data over the internet."
    );
  }

  // DOM manipulation (JS specific)
  if (
    language === "JavaScript" &&
    /\b(document.getElementById|document.querySelector)\b/.test(code)
  ) {
    findings.push(
      "It interacts with the web page's <strong>HTML structure</strong> (the DOM) to find and manipulate elements."
    );
  }

  // Console output
  if (/\b(console.log|print|System.out.println)\b/.test(code)) {
    findings.push(
      "It includes a statement to <strong>output information</strong>, likely for debugging purposes in the developer console."
    );
  }

  // Return statement
  if (/\breturn\b/.test(code)) {
    findings.push(
      "The function likely <strong>returns a value</strong> back to whatever called it."
    );
  }

  // --- Construct Final Explanation ---
  if (findings.length === 0) {
    explanation +=
      "This is a simple piece of code. My analysis couldn't identify any complex structures, but it likely performs a straightforward operation.";
  } else {
    explanation += "<ul>";
    findings.forEach((finding) => {
      explanation += `<li>${finding}</li>`;
    });
    explanation += "</ul>";
    explanation += `\nIn summary, this snippet is designed to ${
      findings.length > 0
        ? findings[0].toLowerCase().replace("it defines", "define")
        : "perform a basic task"
    }.`;
  }

  return explanation.replace(/\n/g, "<br>");
}

/**
 * "AI" logic to generate optimization suggestions for a code snippet.
 * @param {string} code - The code snippet to analyze.
 * @param {string} language - The programming language.
 * @returns {string} The generated suggestions as an HTML string.
 */
function generateOptimizations(code, language) {
  let suggestions = [];

  if (language === "JavaScript") {
    // Suggest 'let'/'const' over 'var'
    if (/\bvar\b/.test(code)) {
      suggestions.push(
        "Consider using <code>let</code> or <code>const</code> instead of <code>var</code> for block-scoped variables, which can prevent unexpected behavior."
      );
    }

    // Suggest strict equality
    if (/==(?!=)/.test(code)) {
      suggestions.push(
        "Using strict equality (<code>===</code>) is generally safer than loose equality (<code>==</code>) as it prevents type coercion."
      );
    }

    // Suggest textContent over innerHTML
    if (/\.innerHTML\s*=/.test(code)) {
      suggestions.push(
        "When setting text content, prefer using <code>.textContent</code> over <code>.innerHTML</code> to prevent Cross-Site Scripting (XSS) vulnerabilities."
      );
    }
  }

  if (suggestions.length === 0) return "";

  return "<ul>" + suggestions.map((s) => `<li>${s}</li>`).join("") + "</ul>";
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

function handleExplainClick() {
  const code = codeInput.value.trim();
  const language = languageSelect.value;

  if (!code) {
    alert("Please paste some code into the text area first.");
    return;
  }

  statusEl.innerHTML =
    '<div class="spinner-border spinner-border-sm" role="status"></div><span class="ms-2">AI is thinking...</span>';
  explanationEl.innerHTML = "";

  setTimeout(() => {
    const explanation = generateExplanation(code, language);
    explanationEl.innerHTML = explanation;
    statusEl.textContent = "";
  }, 1500 + Math.random() * 1000); // Simulate API call delay
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

  explainBtn.addEventListener("click", handleExplainClick);
  copyBtn.addEventListener("click", handleCopyExplanation);
}

export function cleanup() {
  if (explainBtn) explainBtn.removeEventListener("click", handleExplainClick);
  if (copyBtn) copyBtn.removeEventListener("click", handleCopyExplanation);
}
