// js/tools/connect-four.js

let grid, statusEl, resetBtn;
const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayer = 1;
let isGameOver = false;

function createBoard() {
    grid.innerHTML = '';
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    isGameOver = false;
    currentPlayer = 1;
    statusEl.textContent = "Player 1's Turn";
    statusEl.style.color = 'var(--bs-red)';

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.style.backgroundColor = '#212529';
            cell.style.borderRadius = '50%';
            cell.addEventListener('click', handleCellClick);
            grid.appendChild(cell);
        }
    }
}

function handleCellClick(e) {
    if (isGameOver) return;

    const col = parseInt(e.target.dataset.col);
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            dropToken(r, col);
            return;
        }
    }
}

function dropToken(r, c) {
    board[r][c] = currentPlayer;
    const cell = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
    cell.style.backgroundColor = currentPlayer === 1 ? 'var(--bs-red)' : 'var(--bs-yellow)';

    if (checkForWin(r, c)) {
        isGameOver = true;
        statusEl.textContent = `Player ${currentPlayer} Wins!`;
        return;
    }

    if (board.flat().every(cell => cell !== 0)) {
        isGameOver = true;
        statusEl.textContent = "It's a Draw!";
        return;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    statusEl.textContent = `Player ${currentPlayer}'s Turn`;
    statusEl.style.color = currentPlayer === 1 ? 'var(--bs-red)' : 'var(--bs-yellow)';
}

function checkForWin(r, c) {
    const player = board[r][c];

    function checkDirection(dr, dc) {
        let count = 0;
        for (let i = -3; i <= 3; i++) {
            const newR = r + i * dr;
            const newC = c + i * dc;
            if (newR >= 0 && newR < ROWS && newC >= 0 && newC < COLS && board[newR][newC] === player) {
                count++;
                if (count === 4) return true;
            } else {
                count = 0;
            }
        }
        return false;
    }

    return checkDirection(0, 1) || // Horizontal
           checkDirection(1, 0) || // Vertical
           checkDirection(1, 1) || // Diagonal \
           checkDirection(1, -1);  // Diagonal /
}

export function init() {
    grid = document.getElementById('connect-four-grid');
    statusEl = document.getElementById('c4-status');
    resetBtn = document.getElementById('c4-reset-btn');

    createBoard();
    resetBtn.addEventListener('click', createBoard);
}

export function cleanup() {
    resetBtn?.removeEventListener('click', createBoard);
}