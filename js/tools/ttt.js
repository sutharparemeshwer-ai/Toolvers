// js/tools/ttt.js (Finalized Code)

let cells = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let cellElements = []; 
let resetHandler = null; 

// References to DOM elements (Assumes ttt.html is loaded)
const board = () => document.getElementById("board");
const winnerText = () => document.getElementById("winner");
const resetBtn = () => document.getElementById("resetBtn");


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
  if (cells[index] !== "" || !gameActive) return;
  
  cells[index] = currentPlayer;
  cellElements[index].textContent = currentPlayer; // Efficient UI update

  if (checkWinner()) return; 

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  winnerText().textContent = `Player ${currentPlayer}'s turn`;
}

// Checks if the current move results in a win or draw
function checkWinner() {
  const combos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let combo of combos) {
    const [a, b, c] = combo;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      winnerText().textContent = `🎉 Player ${cells[a]} Wins!`;
      gameActive = false;
      
      // Highlight winning cells using theme color
      cellElements[a].style.backgroundColor = cellElements[b].style.backgroundColor = cellElements[c].style.backgroundColor = '#9a8c98';
      return true;
    }
  }

  if (!cells.includes("")) {
    winnerText().textContent = "😐 It's a Draw!";
    gameActive = false;
    return true;
  }
  return false;
}

// Resets all game state variables
function resetGame() {
  cells = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  createBoard();
}

// ------------------------------------
// Router Lifecycle Functions (Stability Fix)
// ------------------------------------
export function init() {
  const rstBtn = resetBtn();
  if (rstBtn) {
    resetHandler = resetGame;
    rstBtn.addEventListener("click", resetHandler);
  }
  createBoard();
}

export function cleanup() {
  const rstBtn = resetBtn();
  if (rstBtn && resetHandler) {
    rstBtn.removeEventListener("click", resetHandler);
    resetHandler = null;
  }
  // Clear the board UI when navigating away
  const boardEl = board();
  if (boardEl) boardEl.innerHTML = ''; 
}