// js/tools/color-game.js

// --- State ---
let numSquares = 6;
let colors = [];
let pickedColor;

// --- DOM Elements ---
let squares, colorDisplay, messageDisplay, resetButton;

/**
 * Generates a random RGB color string.
 * @returns {string} e.g., "rgb(255, 0, 100)"
 */
function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Generates an array of random RGB color strings.
 * @param {number} num - The number of colors to generate.
 * @returns {string[]}
 */
function generateRandomColors(num) {
  const arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(randomColor());
  }
  return arr;
}

/**
 * Picks a random color from the `colors` array to be the correct answer.
 */
function pickWinningColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

/**
 * Changes the color of all squares to the correct color when the user wins.
 * @param {string} color - The winning color.
 */
function changeColors(color) {
  squares.forEach((square) => {
    square.style.opacity = "1"; // Make sure it's visible
    square.style.backgroundColor = color;
  });
}

/**
 * Resets the game to a new state.
 */
function resetGame() {
  colors = generateRandomColors(numSquares);
  pickedColor = pickWinningColor();
  colorDisplay.textContent = pickedColor.toUpperCase();
  messageDisplay.textContent = "Pick a color!";
  resetButton.textContent = "New Colors";

  const container = document.getElementById("color-boxes");
  container.innerHTML = ""; // Clear old squares

  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement("div");
    square.className = "color-box";
    // Use a CSS variable to ensure the color is applied correctly, overriding theme styles.
    square.style.setProperty("--js-color", colors[i]);
    square.addEventListener("click", handleSquareClick);
    container.appendChild(square);
  }
  // Re-select the squares after creating them
  squares = document.querySelectorAll(".color-box");
}

/**
 * Handles the logic when a user clicks on a color square.
 */
function handleSquareClick() {
  // Read the color from the CSS variable
  const clickedColor = this.style.getPropertyValue("--js-color");

  if (clickedColor === pickedColor) {
    messageDisplay.textContent = "Correct!";
    resetButton.textContent = "Play Again?";
    changeColors(clickedColor);
  } else {
    this.style.opacity = "0"; // Fade out the wrong square
    messageDisplay.textContent = "Try Again";
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  colorDisplay = document.getElementById("color-display");
  messageDisplay = document.getElementById("message");
  resetButton = document.getElementById("new-colors-btn");

  // Initial game setup
  resetGame();

  // Attach event listeners
  resetButton.addEventListener("click", resetGame);
}

export function cleanup() {
  // Remove event listeners to prevent memory leaks
  if (resetButton) {
    resetButton.removeEventListener("click", resetGame);
  }
  // The square listeners are removed automatically when innerHTML is cleared.
}
