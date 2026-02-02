// js/tools/connect-four.js

const ROWS = 6, COLS = 7;
let board = [], curr = 1, active = true;

function setup() {
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    curr = 1;
    active = true;
    document.getElementById('c4-msg').textContent = "Red's Turn";
    document.getElementById('c4-msg').className = 'text-danger fw-bold small';
    
    const grid = document.getElementById('c4-grid');
    grid.innerHTML = '';
    
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'c4-cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            grid.appendChild(cell);
        }
    }
}

function drop(c) {
    if(!active) return;
    
    // Find lowest empty
    let r = -1;
    for(let i=ROWS-1; i>=0; i--) {
        if(board[i][c] === 0) { r = i; break; }
    }
    
    if(r === -1) return; // Col full
    
    board[r][c] = curr;
    
    const cell = document.querySelector(`.c4-cell[data-r="${r}"][data-c="${c}"]`);
    cell.classList.add(curr === 1 ? 'red' : 'yellow');
    
    if(checkWin(r, c)) {
        active = false;
        document.getElementById('c4-msg').textContent = `${curr === 1 ? 'Red' : 'Yellow'} Wins!`;
    } else {
        curr = curr === 1 ? 2 : 1;
        document.getElementById('c4-msg').textContent = `${curr === 1 ? 'Red' : 'Yellow'}'s Turn`;
        document.getElementById('c4-msg').className = curr === 1 ? 'text-danger fw-bold small' : 'text-warning fw-bold small';
    }
}

function checkWin(r, c) {
    const p = board[r][c];
    
    // Directions: Horiz, Vert, Diag1, Diag2
    const dirs = [[0,1], [1,0], [1,1], [1,-1]];
    
    return dirs.some(([dr, dc]) => {
        let count = 1;
        // Check forward
        for(let i=1; i<4; i++) {
            const nr = r + dr*i, nc = c + dc*i;
            if(nr<0 || nr>=ROWS || nc<0 || nc>=COLS || board[nr][nc]!==p) break;
            count++;
        }
        // Check backward
        for(let i=1; i<4; i++) {
            const nr = r - dr*i, nc = c - dc*i;
            if(nr<0 || nr>=ROWS || nc<0 || nc>=COLS || board[nr][nc]!==p) break;
            count++;
        }
        return count >= 4;
    });
}

export function init() {
    setup();
    document.getElementById('c4-grid').addEventListener('click', e => {
        if(e.target.classList.contains('c4-cell')) {
            drop(parseInt(e.target.dataset.c));
        }
    });
    document.getElementById('reset-btn').addEventListener('click', setup);
}

export function cleanup() {}
