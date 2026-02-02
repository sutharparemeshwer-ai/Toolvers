// js/tools/minesweeper.js

let grid, timerEl, interval;
const SIZE = 10, MINES = 15;
let board = [], gameOver = false, time = 0;

window.initMines = () => {
    grid = document.getElementById('mine-grid');
    timerEl = document.getElementById('timer');
    grid.style.gridTemplateColumns = `repeat(${SIZE}, 30px)`;
    grid.innerHTML = '';
    board = [];
    gameOver = false;
    time = 0;
    
    if(interval) clearInterval(interval);
    interval = setInterval(() => {
        time++;
        timerEl.textContent = String(time).padStart(3, '0');
    }, 1000);

    // Create Board
    for(let i=0; i<SIZE*SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'mine-cell';
        cell.dataset.i = i;
        cell.onclick = () => click(i);
        cell.oncontextmenu = (e) => { e.preventDefault(); flag(cell); };
        grid.appendChild(cell);
        board.push({ mine: false, revealed: false, count: 0 });
    }

    // Place Mines
    let m = 0;
    while(m < MINES) {
        const i = Math.floor(Math.random() * (SIZE*SIZE));
        if(!board[i].mine) {
            board[i].mine = true;
            m++;
        }
    }

    // Calc Counts
    for(let i=0; i<SIZE*SIZE; i++) {
        if(board[i].mine) continue;
        let c = 0;
        const r = Math.floor(i/SIZE), col = i%SIZE;
        for(let x=-1; x<=1; x++) {
            for(let y=-1; y<=1; y++) {
                const nr = r+x, nc = col+y;
                if(nr>=0 && nr<SIZE && nc>=0 && nc<SIZE) {
                    const idx = nr*SIZE + nc;
                    if(board[idx].mine) c++;
                }
            }
        }
        board[i].count = c;
    }
};

function click(i) {
    if(gameOver || board[i].revealed) return;
    const cell = grid.children[i];
    
    if(board[i].mine) {
        cell.classList.add('mine', 'revealed');
        cell.innerHTML = '<i class="fa-solid fa-bomb"></i>';
        gameOver = true;
        clearInterval(interval);
        alert('BOOM!');
    } else {
        reveal(i);
    }
}

function reveal(i) {
    if(i<0 || i>=SIZE*SIZE || board[i].revealed) return;
    board[i].revealed = true;
    const cell = grid.children[i];
    cell.classList.add('revealed');
    
    if(board[i].count > 0) {
        cell.textContent = board[i].count;
        const colors = [null, 'blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'];
        cell.style.color = colors[board[i].count];
    } else {
        // Flood fill
        const r = Math.floor(i/SIZE), col = i%SIZE;
        for(let x=-1; x<=1; x++) {
            for(let y=-1; y<=1; y++) {
                const nr = r+x, nc = col+y;
                if(nr>=0 && nr<SIZE && nc>=0 && nc<SIZE) {
                    reveal(nr*SIZE + nc);
                }
            }
        }
    }
}

function flag(cell) {
    if(gameOver || cell.classList.contains('revealed')) return;
    if(cell.innerHTML === '') cell.innerHTML = '<i class="fa-solid fa-flag text-danger"></i>';
    else cell.innerHTML = '';
}

export function init() {
    window.initMines();
}
export function cleanup() {
    window.initMines = undefined;
    if(interval) clearInterval(interval);
}
