// js/tools/maze-solver.js

// --- DOM Elements & Canvas ---
let canvas, ctx;
let statusEl, newMazeBtn;

// --- Game Constants & State ---
const MAZE_SIZE = 25; // 25x25 grid
let TILE_SIZE;
let maze = [];
let player = { x: 0, y: 0 };
let goal = { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 };
let isGameOver = false;

// --- Maze Generation (Recursive Backtracker) ---
function generateMaze() {
    // 1. Initialize grid with walls
    maze = Array(MAZE_SIZE).fill(null).map(() => Array(MAZE_SIZE).fill(1)); // 1 = wall
    const stack = [];
    const startX = 0, startY = 0;

    maze[startY][startX] = 0; // 0 = path
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];

        // Check potential neighbors (2 cells away)
        const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];
        for (const [dx, dy] of directions) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && maze[ny][nx] === 1) {
                neighbors.push({ x: nx, y: ny, dx, dy });
            }
        }

        if (neighbors.length > 0) {
            const { x: nextX, y: nextY, dx, dy } = neighbors[Math.floor(Math.random() * neighbors.length)];
            // Carve path to the neighbor
            maze[nextY][nextX] = 0;
            maze[current.y + dy / 2][current.x + dx / 2] = 0;
            stack.push({ x: nextX, y: nextY });
        } else {
            stack.pop(); // Backtrack
        }
    }
}

// --- Drawing Functions ---
function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
            ctx.fillStyle = maze[y][x] === 1 ? '#343a40' : '#f8f9fa';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // Draw Player
    ctx.fillStyle = '#0d6efd'; // Blue
    ctx.beginPath();
    ctx.arc(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw Goal
    ctx.fillStyle = '#198754'; // Green
    ctx.fillRect(goal.x * TILE_SIZE, goal.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

// --- Game Control ---
function startNewGame() {
    isGameOver = false;
    player = { x: 0, y: 0 };
    statusEl.textContent = 'Use Arrow Keys to reach the goal!';
    statusEl.classList.remove('text-success');
    generateMaze();
    drawMaze();
}

function checkWin() {
    if (player.x === goal.x && player.y === goal.y) {
        isGameOver = true;
        statusEl.textContent = 'You Win! 🎉';
        statusEl.classList.add('text-success', 'fw-bold');
    }
}

// --- Player Movement ---
function movePlayer(direction) {
    if (isGameOver) return;

    let newX = player.x;
    let newY = player.y;

    if (direction === 'up') newY--;
    if (direction === 'down') newY++;
    if (direction === 'left') newX--;
    if (direction === 'right') newX++;

    // Check for valid move (within bounds and not a wall)
    if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && maze[newY][newX] === 0) {
        player.x = newX;
        player.y = newY;
        drawMaze();
        checkWin();
    }
}


// --- Event Handlers ---
function handleKeyDown(e) {
    if (isGameOver) return;

    const key = e.key;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;

    e.preventDefault();

    if (key === 'ArrowUp') movePlayer('up');
    if (key === 'ArrowDown') movePlayer('down');
    if (key === 'ArrowLeft') movePlayer('left');
    if (key === 'ArrowRight') movePlayer('right');
}

// We define these as named functions so they can be properly removed.
const handleUpClick = () => movePlayer('up');
const handleDownClick = () => movePlayer('down');
const handleLeftClick = () => movePlayer('left');
const handleRightClick = () => movePlayer('right');

// --- Router Hooks ---
export function init() {
    // Get DOM elements
    canvas = document.getElementById('maze-canvas');
    ctx = canvas.getContext('2d');
    statusEl = document.getElementById('maze-status');
    newMazeBtn = document.getElementById('new-maze-btn');

    // Calculate tile size based on canvas and maze dimensions
    // The canvas is 501px to avoid sub-pixel rendering issues with an odd maze size
    TILE_SIZE = canvas.width / MAZE_SIZE;

    // Attach listeners
    newMazeBtn.addEventListener('click', startNewGame);
    document.addEventListener('keydown', handleKeyDown);

    // Attach mobile control listeners
    const btnUp = document.getElementById('maze-btn-up');
    const btnDown = document.getElementById('maze-btn-down');
    const btnLeft = document.getElementById('maze-btn-left');
    const btnRight = document.getElementById('maze-btn-right');
    if (btnUp) btnUp.addEventListener('click', handleUpClick);
    if (btnDown) btnDown.addEventListener('click', handleDownClick);
    if (btnLeft) btnLeft.addEventListener('click', handleLeftClick);
    if (btnRight) btnRight.addEventListener('click', handleRightClick);

    // Start the first game
    startNewGame();
}

export function cleanup() {
    // Remove listeners
    newMazeBtn?.removeEventListener('click', startNewGame);
    document.removeEventListener('keydown', handleKeyDown);

    // Remove mobile control listeners
    const btnUp = document.getElementById('maze-btn-up');
    const btnDown = document.getElementById('maze-btn-down');
    const btnLeft = document.getElementById('maze-btn-left');
    const btnRight = document.getElementById('maze-btn-right');
    if (btnUp) btnUp.removeEventListener('click', handleUpClick);
    if (btnDown) btnDown.removeEventListener('click', handleDownClick);
    if (btnLeft) btnLeft.removeEventListener('click', handleLeftClick);
    if (btnRight) btnRight.removeEventListener('click', handleRightClick);
}