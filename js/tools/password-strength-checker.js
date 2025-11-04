// js/tools/password-strength-checker.js

import { COMMON_PASSWORDS } from "../data/common-passwords.js";

// --- DOM Elements ---
let passwordInput, toggleBtn, strengthBar, strengthText, feedbackList;

// --- Core Logic ---

function checkPasswordStrength() {
  const password = passwordInput.value;
  let score = 0;
  const feedback = [];

  // --- Criteria Checks ---
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isCommon = COMMON_PASSWORDS.has(password.toLowerCase());

  // --- Scoring ---
  if (hasLength) score++;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;
  if (password.length >= 12) score++; // Bonus for longer passwords

  // If it's a common password, override the score to be very weak.
  if (isCommon) {
    score = 1;
    feedback.push({ text: "Is a very common password", met: false });
  }

  // --- Feedback Generation ---
  if (!hasLength)
    feedback.push({ text: "At least 8 characters long", met: false });
  if (!hasUppercase)
    feedback.push({ text: "Contains an uppercase letter (A-Z)", met: false });
  if (!hasLowercase)
    feedback.push({ text: "Contains a lowercase letter (a-z)", met: false });
  if (!hasNumber)
    feedback.push({ text: "Contains a number (0-9)", met: false });
  if (!hasSymbol)
    feedback.push({ text: "Contains a symbol (!@#$...)", met: false });

  // --- UI Updates ---
  updateStrengthBar(score);
  updateFeedbackList(feedback);
}

function updateStrengthBar(score) {
  const percentage = (score / 6) * 100;
  strengthBar.style.width = `${percentage}%`;
  strengthBar.setAttribute("aria-valuenow", percentage);

  // Remove all color classes and then add the correct one
  strengthBar.classList.remove(
    "bg-danger",
    "bg-warning",
    "bg-info",
    "bg-success"
  );

  if (score <= 2) {
    strengthBar.classList.add("bg-danger");
    strengthText.textContent = "Weak";
  } else if (score <= 4) {
    strengthBar.classList.add("bg-warning");
    strengthText.textContent = "Moderate";
  } else {
    strengthBar.classList.add("bg-success");
    strengthText.textContent = "Strong";
  }

  if (passwordInput.value.length === 0) {
    strengthBar.style.width = "0%";
    strengthText.textContent = "Enter a password to check its strength.";
  }
}

function updateFeedbackList(feedbackItems) {
  feedbackList.innerHTML = "";
  if (passwordInput.value.length > 0 && feedbackItems.length > 0) {
    feedbackItems.forEach((item) => {
      const li = document.createElement("div");
      li.className = "list-group-item d-flex align-items-center";
      li.innerHTML = `
                <i class="fa-solid ${
                  item.met ? "fa-check text-success" : "fa-times text-danger"
                } me-2"></i>
                ${item.text}
            `;
      feedbackList.appendChild(li);
    });
  }
}

function togglePasswordVisibility() {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  toggleBtn.innerHTML = isPassword
    ? '<i class="fa-solid fa-eye-slash"></i>'
    : '<i class="fa-solid fa-eye"></i>';
}

// --- Event Handlers ---

function handleInput() {
  checkPasswordStrength();
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  passwordInput = document.getElementById("password-input");
  toggleBtn = document.getElementById("toggle-password-visibility");
  strengthBar = document.getElementById("strength-bar");
  strengthText = document.getElementById("strength-text");
  feedbackList = document.getElementById("feedback-list");

  // Attach event listeners
  passwordInput.addEventListener("input", handleInput);
  toggleBtn.addEventListener("click", togglePasswordVisibility);

  // Initial check
  checkPasswordStrength();
}

export function cleanup() {
  // Remove event listeners to prevent memory leaks
  if (passwordInput) {
    passwordInput.removeEventListener("input", handleInput);
  }
  if (toggleBtn) {
    toggleBtn.removeEventListener("click", togglePasswordVisibility);
  }
}
