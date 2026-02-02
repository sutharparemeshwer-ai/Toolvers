// js/tools/sudoku.js

let board = [], solution = [], selected = null;

function generate(diff) {
    // Simple generator placeholder (full logic is complex, using pre-filled or backtracking)
    // For demo, we'll use a valid solved board and remove cells
    const base = [
        [5,3,4,6,7,8,9,1,2], [6,7,2,1,9,5,3,4,8], [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3], [4,2,6,8,5,3,7,9,1], [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4], [2,8,7,4,1,9,6,3,5], [3,4,5,2,8,6,1,7,9]
    ];
    
    // Shuffle rows/cols/numbers to randomize
    solution = base; // Simplified for stability
    board = JSON.parse(JSON.stringify(solution));
    
    const removeCount = diff === 'easy' ? 30 : (diff === 'medium' ? 45 : 55);
    for(let i=0; i<removeCount; i++) {
        const r = Math.floor(Math.random()*9);
        const c = Math.floor(Math.random()*9);
        board[r][c] = 0;
    }
    
    render();
}

function render() {
    const grid = document.getElementById('sudo-grid');
    grid.innerHTML = '';
    
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            const cell = document.createElement('div');
            cell.className = 'sudo-cell';
            const val = board[r][c];
            if(val !== 0) {
                cell.textContent = val;
                cell.classList.add('prefilled');
            }
            cell.onclick = () => select(cell, r, c);
            grid.appendChild(cell);
        }
    }
}

function select(cell, r, c) {
    if(selected) selected.classList.remove('selected');
    selected = cell;
    selected.dataset.r = r;
    selected.dataset.c = c;
    cell.classList.add('selected');
}

function fill(num) {
    if(!selected) return;
    const r = selected.dataset.r;
    const c = selected.dataset.c;
    
    if(num === 0) {
        selected.textContent = '';
        selected.classList.remove('error');
        return;
    }
    
    selected.textContent = num;
    if(num !== solution[r][c]) selected.classList.add('error');
    else selected.classList.remove('error');
}

export function init() {
    document.getElementById('new-btn').addEventListener('click', () => {
        generate(document.getElementById('diff-select').value);
    });
    
    document.querySelectorAll('.num-btn').forEach(b => {
        b.addEventListener('click', () => {
            const val = b.dataset.val !== undefined ? 0 : parseInt(b.textContent);
            fill(val);
        });
    });
    
    generate('easy');
}

export function cleanup() {}