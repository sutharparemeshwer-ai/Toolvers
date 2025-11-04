// js/tools/2048-game.js

let boardEl, scoreEl, newGameBtn, gameOverMsgEl;
let board = [];
let score = 0;
const GRID_SIZE = 4;

function setupGame() {
    board = Array(GRID_SIZE * GRID_SIZE).fill(0);
    score = 0;
    gameOverMsgEl.classList.add('d-none');
    addRandomTile();
    addRandomTile();
    updateBoard();
}

function updateBoard() {
    boardEl.innerHTML = '';
    for (let i = 0; i < board.length; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile-2048';
        const value = board[i];
        tile.textContent = value === 0 ? '' : value;
        tile.dataset.value = value;
        boardEl.appendChild(tile);
    }
    scoreEl.textContent = score;
}

function addRandomTile() {
    const emptyTiles = [];
    board.forEach((value, index) => {
        if (value === 0) emptyTiles.push(index);
    });

    if (emptyTiles.length > 0) {
        const randomIndex = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[randomIndex] = Math.random() > 0.9 ? 4 : 2;
    }
}

function handleKeyDown(e) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();

    if (gameOverMsgEl.classList.contains('d-none')) {
        const originalBoard = [...board];
        switch (e.key) {
            case 'ArrowUp': moveUp(); break;
            case 'ArrowDown': moveDown(); break;
            case 'ArrowLeft': moveLeft(); break;
            case 'ArrowRight': moveRight(); break;
        }
        
        const moved = JSON.stringify(originalBoard) !== JSON.stringify(board);
        if (moved) {
            addRandomTile();
            updateBoard();
            checkGameOver();
        }
    }
}

function slide(row) {
    const filteredRow = row.filter(val => val);
    const missing = GRID_SIZE - filteredRow.length;
    const zeros = Array(missing).fill(0);
    return filteredRow.concat(zeros);
}

function combine(row) {
    for (let i = 0; i < GRID_SIZE - 1; i++) {
        if (row[i] !== 0 && row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i];
            row[i + 1] = 0;
        }
    }
    return row;
}

function operate(row) {
    row = slide(row);
    row = combine(row);
    row = slide(row);
    return row;
}

function moveLeft() {
    for (let r = 0; r < GRID_SIZE; r++) {
        const row = board.slice(r * GRID_SIZE, r * GRID_SIZE + GRID_SIZE);
        const newRow = operate(row);
        for (let c = 0; c < GRID_SIZE; c++) {
            board[r * GRID_SIZE + c] = newRow[c];
        }
    }
}

function moveRight() {
    for (let r = 0; r < GRID_SIZE; r++) {
        const row = board.slice(r * GRID_SIZE, r * GRID_SIZE + GRID_SIZE);
        const newRow = operate(row.reverse()).reverse();
        for (let c = 0; c < GRID_SIZE; c++) {
            board[r * GRID_SIZE + c] = newRow[c];
        }
    }
}

function moveUp() {
    for (let c = 0; c < GRID_SIZE; c++) {
        const col = [board[c], board[c + GRID_SIZE], board[c + 2 * GRID_SIZE], board[c + 3 * GRID_SIZE]];
        const newCol = operate(col);
        for (let r = 0; r < GRID_SIZE; r++) {
            board[r * GRID_SIZE + c] = newCol[r];
        }
    }
}

function moveDown() {
    for (let c = 0; c < GRID_SIZE; c++) {
        const col = [board[c], board[c + GRID_SIZE], board[c + 2 * GRID_SIZE], board[c + 3 * GRID_SIZE]];
        const newCol = operate(col.reverse()).reverse();
        for (let r = 0; r < GRID_SIZE; r++) {
            board[r * GRID_SIZE + c] = newCol[r];
        }
    }
}

function canMove() {
    for (let i = 0; i < board.length; i++) {
        if (board[i] === 0) return true;
        const row = Math.floor(i / GRID_SIZE);
        const col = i % GRID_SIZE;
        if (col < GRID_SIZE - 1 && board[i] === board[i + 1]) return true;
        if (row < GRID_SIZE - 1 && board[i] === board[i + GRID_SIZE]) return true;
    }
    return false;
}

function checkGameOver() {
    if (!canMove()) {
        gameOverMsgEl.innerHTML = `<h5>Game Over!</h5><p>Final Score: ${score}</p>`;
        gameOverMsgEl.classList.remove('d-none');
    }
}

export function init() {
    boardEl = document.getElementById('game-2048-board');
    scoreEl = document.getElementById('game-2048-score');
    newGameBtn = document.getElementById('new-game-2048-btn');
    gameOverMsgEl = document.getElementById('game-2048-over-message');

    newGameBtn.addEventListener('click', setupGame);
    document.addEventListener('keydown', handleKeyDown);

    setupGame();
}

export function cleanup() {
    newGameBtn?.removeEventListener('click', setupGame);
    document.removeEventListener('keydown', handleKeyDown);
}