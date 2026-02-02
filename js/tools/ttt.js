// js/tools/ttt.js

let board = Array(9).fill(null);
let turn = 'X';
let mode = 'pvp'; // pvp or pvc
let active = false;

function startTTT(m) {
    console.log('Starting TTT in mode:', m);
    mode = m;
    active = true;
    turn = 'X';
    board.fill(null);
    
    // Check for both ID styles (Legacy/New)
    const setup = document.getElementById('setup-screen');
    const game = document.getElementById('game-screen');
    const p2Label = document.getElementById('p2-label');
    
    if (setup) setup.classList.add('d-none');
    if (game) game.classList.remove('d-none');
    if (p2Label) p2Label.textContent = mode === 'pvc' ? 'Computer (O)' : 'Player O';
    
    render();
}

function resetTTT() {
    active = false;
    const setup = document.getElementById('setup-screen');
    const game = document.getElementById('game-screen');
    
    if (setup) setup.classList.remove('d-none');
    if (game) game.classList.add('d-none');
}

function checkWin() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(let c of wins) {
        if(board[c[0]] && board[c[0]] === board[c[1]] && board[c[0]] === board[c[2]]) return board[c[0]];
    }
    if(!board.includes(null)) return 'draw';
    return null;
}

function render() {
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach((c, i) => {
        c.textContent = board[i] || '';
        c.className = 'ttt-cell'; // Reset base class
        if(board[i]) c.classList.add(board[i].toLowerCase());
    });
    
    const w = checkWin();
    const msg = document.getElementById('game-msg');
    
    if (msg) {
        if(w) {
            active = false;
            if(w === 'draw') {
                msg.innerHTML = "It's a Draw!";
            } else {
                msg.innerHTML = `<span class="${w === 'X' ? 'text-primary' : 'text-danger'}">${w} Wins!</span>`;
            }
        } else {
            msg.textContent = `Turn: ${turn}`;
        }
    }
}

function handleClick(i) {
    if(!active || board[i]) return;
    
    board[i] = turn;
    turn = turn === 'X' ? 'O' : 'X';
    render();

    // Check win AFTER render to show the move
    const winner = checkWin();
    if (winner) return; // Stop if game over

    if(active && mode === 'pvc' && turn === 'O') {
        setTimeout(cpuMove, 500);
    }
}

function cpuMove() {
    if(!active) return;
    const avail = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    
    if(avail.length > 0) {
        const move = avail[Math.floor(Math.random() * avail.length)];
        handleClick(move);
    }
}

export function init() {
    console.log('TTT Initializing...');
    
    window.requestAnimationFrame(() => {
        const pvpBtn = document.getElementById('btn-pvp') || document.getElementById('vs-player-btn');
        const pvcBtn = document.getElementById('btn-pvc') || document.getElementById('vs-computer-btn');
        const resetBtn = document.getElementById('btn-reset') || document.getElementById('resetBtn');
        const cells = document.querySelectorAll('.ttt-cell');

        if (pvpBtn) {
            // Using onclick ensures we don't duplicate listeners if init runs multiple times
            pvpBtn.onclick = () => startTTT('pvp'); 
        } else {
            console.error('TTT: PvP Button not found');
        }
        
        if (pvcBtn) {
            pvcBtn.onclick = () => startTTT('pvc');
        }

        if (resetBtn) {
            resetBtn.onclick = resetTTT;
        }

        cells.forEach(c => {
            c.onclick = (e) => handleClick(parseInt(e.target.dataset.i));
        });
    });
}

export function cleanup() {
    // Cleanup handled by DOM removal
}