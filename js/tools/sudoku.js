// js/tools/sudoku.js

let gridEl, numberPaletteEl, newGameBtn, validateBtn, solveBtn, difficultyLabel;
let difficultyBtns;

let board = [];
let solution = [];
let selectedCell = null;
let difficulty = "easy"; // 'easy', 'medium', 'hard'

const DIFFICULTY_LEVELS = { easy: 40, medium: 30, hard: 20 };

function createEmptyBoard() {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));
}

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
}

function solveSudoku(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
          () => Math.random() - 0.5
        );
        for (let num of nums) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (solveSudoku(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generatePuzzle() {
  board = createEmptyBoard();
  solveSudoku(board);
  solution = JSON.parse(JSON.stringify(board)); // Deep copy

  let cellsToRemove = 81 - DIFFICULTY_LEVELS[difficulty];
  while (cellsToRemove > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (board[r][c] !== 0) {
      board[r][c] = 0;
      cellsToRemove--;
    }
  }
}

function renderBoard() {
  gridEl.innerHTML = "";
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.className = "sudoku-cell";
      cell.dataset.row = r;
      cell.dataset.col = c;

      const value = board[r][c];
      if (value !== 0) {
        cell.textContent = value;
        cell.classList.add("pre-filled");
      } else {
        cell.addEventListener("click", () => selectCell(cell));
      }
      gridEl.appendChild(cell);
    }
  }
}

function renderPalette() {
  numberPaletteEl.innerHTML = "";
  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.className = "btn btn-secondary";
    btn.textContent = i;
    btn.addEventListener("click", () => fillCell(i));
    numberPaletteEl.appendChild(btn);
  }
  const eraseBtn = document.createElement("button");
  eraseBtn.className = "btn btn-danger";
  eraseBtn.innerHTML = '<i class="fa-solid fa-eraser"></i>';
  eraseBtn.addEventListener("click", () => fillCell(0));
  numberPaletteEl.appendChild(eraseBtn);
}

function selectCell(cell) {
  if (selectedCell) {
    selectedCell.classList.remove("selected");
  }
  selectedCell = cell;
  selectedCell.classList.add("selected");
}

function fillCell(num) {
  if (!selectedCell || selectedCell.classList.contains("pre-filled")) return;

  const r = selectedCell.dataset.row;
  const c = selectedCell.dataset.col;

  if (num === 0) {
    selectedCell.textContent = "";
    board[r][c] = 0;
  } else {
    selectedCell.textContent = num;
    board[r][c] = num;
  }
  selectedCell.classList.remove("invalid");
}

function validateBoard() {
  let isCompleteAndCorrect = true;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = gridEl.querySelector(`[data-row='${r}'][data-col='${c}']`);
      cell.classList.remove("invalid");
      if (!cell.classList.contains("pre-filled")) {
        if (board[r][c] === 0 || board[r][c] !== solution[r][c]) {
          isCompleteAndCorrect = false;
          if (board[r][c] !== 0) {
            cell.classList.add("invalid");
          }
        }
      }
    }
  }
  if (isCompleteAndCorrect) {
    alert("Congratulations! You solved the puzzle correctly!");
  } else {
    alert("There are some errors or empty cells. Keep trying!");
  }
}

function solveBoard() {
  board = JSON.parse(JSON.stringify(solution));
  renderBoard();
}

function startNewGame() {
  generatePuzzle();
  renderBoard();
}

function handleDifficultyChange(e) {
  e.preventDefault();
  const newDifficulty = e.target.dataset.difficulty;
  if (newDifficulty) {
    difficulty = newDifficulty;
    difficultyLabel.textContent =
      newDifficulty.charAt(0).toUpperCase() + newDifficulty.slice(1);
    startNewGame();
  }
}

export function init() {
  gridEl = document.getElementById("sudoku-grid");
  numberPaletteEl = document.getElementById("number-palette");
  newGameBtn = document.getElementById("new-game-btn");
  validateBtn = document.getElementById("validate-btn");
  solveBtn = document.getElementById("solve-btn");
  difficultyLabel = document.getElementById("difficulty-label");
  difficultyBtns = document.querySelectorAll(".difficulty-btn");

  newGameBtn.addEventListener("click", startNewGame);
  validateBtn.addEventListener("click", validateBoard);
  solveBtn.addEventListener("click", solveBoard);
  difficultyBtns.forEach((btn) =>
    btn.addEventListener("click", handleDifficultyChange)
  );

  document.addEventListener("keydown", (e) => {
    if (selectedCell) {
      if (e.key >= "1" && e.key <= "9") {
        fillCell(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        fillCell(0);
      }
    }
  });

  renderPalette();
  startNewGame();
}

export function cleanup() {
  // Remove listeners if needed, though for this tool it's less critical
  // as elements are part of the loaded tool content.
  newGameBtn.removeEventListener("click", startNewGame);
  validateBtn.removeEventListener("click", validateBoard);
  solveBtn.removeEventListener("click", solveBoard);
  difficultyBtns.forEach((btn) =>
    btn.removeEventListener("click", handleDifficultyChange)
  );
  // Keyboard listener is on document, might be good to remove if it causes issues.
}
