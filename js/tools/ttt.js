// js/tools/ttt.js (Finalized Code)

let cells = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameMode = "pvp"; // 'pvp' or 'pvc'
let gameActive = true;
let cellElements = [];
let resetHandler = null;

// References to DOM elements (Assumes ttt.html is loaded)
const board = () => document.getElementById("board");
const gameArea = () => document.getElementById("game-area");
const gameModeSelection = () => document.getElementById("game-mode-selection");
const winnerText = () => document.getElementById("winner");
const resetBtn = () => document.getElementById("resetBtn");
const vsPlayerBtn = () => document.getElementById("vs-player-btn");
const vsComputerBtn = () => document.getElementById("vs-computer-btn");

// ------------------------------------
// Core Game Logic
// ------------------------------------

// Creates/Updates the UI board once. Called only on initialization and reset.
function createBoard() {
  const boardEl = board();
  if (!boardEl) return;

  boardEl.innerHTML = "";
  cellElements = [];

  cells.forEach((cell, index) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.textContent = cell;

    // Attach click handler once
    div.addEventListener("click", () => cellClick(index));

    boardEl.appendChild(div);
    cellElements.push(div);
  });

  // Set initial text
  winnerText().textContent = `Player ${currentPlayer}'s turn`;
}

// Handles a click on a cell
function cellClick(index) {
  // Prevent player from clicking during computer's turn or on a taken cell
  if (
    cells[index] !== "" ||
    !gameActive ||
    (gameMode === "pvc" && currentPlayer === "O")
  )
    return;

  cells[index] = currentPlayer;
  cellElements[index].textContent = currentPlayer; // Efficient UI update

  if (checkWinner()) return;

  // Switch player
  switchPlayer();

  // If it's computer's turn, make a move
  if (gameMode === "pvc" && currentPlayer === "O" && gameActive) {
    // Disable board clicks during computer's "thinking" time
    board().style.pointerEvents = "none";
    setTimeout(() => {
      computerMove();
      board().style.pointerEvents = "auto";
    }, 700); // 0.7 second delay
  }
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  let turnText = `Player ${currentPlayer}'s turn`;
  if (gameMode === "pvc" && currentPlayer === "O") {
    turnText = "Computer is thinking...";
  }
  winnerText().textContent = turnText;
}

// Checks if the current move results in a win or draw
function checkWinner(isTest = false) {
  const combos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let combo of combos) {
    const [a, b, c] = combo;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      // A win condition is met
      if (!isTest) {
        // Only update UI and game state if this is not a test move
        winnerText().textContent = `🎉 Player ${cells[a]} Wins!`;
        gameActive = false;

        // Highlight winning cells using theme color
        cellElements[a].style.backgroundColor =
          cellElements[b].style.backgroundColor =
          cellElements[c].style.backgroundColor =
            "#9a8c98";
      }
      return true;
    }
  }

  if (!cells.includes("")) {
    if (!isTest) {
      // Only update UI and game state if not a test move
      winnerText().textContent = "😐 It's a Draw!";
      gameActive = false;
    }
    return true;
  }
  return false;
}

// --- Computer AI Logic ---

/**
 * Finds a winning or blocking move for a given player.
 * @param {string} player - The player to check for ('X' or 'O').
 * @returns {number|null} The index of the move, or null if none found.
 */
function findStrategicMove(player) {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === "") {
      // Only check empty cells
      cells[i] = player; // Temporarily make the move
      const isWinningMove = checkWinner(true); // Check for win without UI changes
      cells[i] = ""; // Undo the move
      if (isWinningMove) {
        return i; // This is the move to make
      }
    }
  }
  return null;
}

/**
 * The computer makes a move based on a simple set of rules.
 */
function computerMove() {
  // This function is called by setTimeout
  if (!gameActive) return;

  let moveIndex = null;

  // 1. Check if the computer ('O') can win
  moveIndex = findStrategicMove("O");
  if (moveIndex === null) {
    // 2. Check if the player ('X') can win, and block them
    moveIndex = findStrategicMove("X");
  }
  if (moveIndex === null) {
    // 3. Take the center if it's available
    if (cells[4] === "") {
      moveIndex = 4;
    }
  }
  if (moveIndex === null) {
    // 4. Fallback: pick a random empty cell
    const emptyCells = cells
      .map((cell, index) => (cell === "" ? index : null))
      .filter((val) => val !== null);
    if (emptyCells.length > 0) {
      moveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
  }

  // If a valid move was found, apply it directly
  if (moveIndex !== null) {
    cells[moveIndex] = currentPlayer; // Apply the computer's move
    cellElements[moveIndex].textContent = currentPlayer; // Update UI

    // Check for winner after the computer's move
    // This will update UI and gameActive if game ends
    if (checkWinner()) {
      return;
    }

    // If no winner, switch player back to 'X' for the human's turn
    switchPlayer();
  }
}

// Resets all game state variables
function resetGame() {
  cells = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  // Hide game area and show mode selection
  gameArea().classList.add("d-none");
  gameModeSelection().classList.remove("d-none");
  winnerText().textContent = ""; // Clear winner text on reset
}

function startGame(mode) {
  gameMode = mode;
  gameModeSelection().classList.add("d-none");
  gameArea().classList.remove("d-none");
  createBoard();
}

// ------------------------------------
// Router Lifecycle Functions (Stability Fix)
// ------------------------------------
export function init() {
  vsPlayerBtn().addEventListener("click", () => startGame("pvp"));
  vsComputerBtn().addEventListener("click", () => startGame("pvc"));

  const rstBtn = resetBtn();
  if (rstBtn) {
    resetHandler = resetGame;
    rstBtn.addEventListener("click", resetHandler);
  }
}

export function cleanup() {
  const rstBtn = resetBtn();
  if (rstBtn && resetHandler) {
    rstBtn.removeEventListener("click", resetHandler);
    resetHandler = null;
  }
  vsPlayerBtn()?.removeEventListener("click", () => startGame("pvp"));
  vsComputerBtn()?.removeEventListener("click", () => startGame("pvc"));

  // Clear the board UI when navigating away
  const boardEl = board();
  if (boardEl) boardEl.innerHTML = "";

  // Ensure game area is hidden on cleanup
  resetGame();
}
