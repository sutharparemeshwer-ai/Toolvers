// js/tools/snake-game-app.js

// DOM Elements
let canvasEl, scoreDisplayEl, gameStatusEl, startBtnEl;
let ctx;

// Game Constants
const TILE_SIZE = 20; // Size of each tile in pixels (20x20)
const GRID_SIZE = 20; // 400px canvas / 20px tile = 20 tiles wide/high
const GAME_SPEED = 150; // Game loop interval in milliseconds (e.g., 150ms)

// Game State
let snake = [];
let food = {};
let dx = TILE_SIZE; // Change in x direction (starts right)
let dy = 0;        // Change in y direction
let score = 0;
let gameLoopInterval = null;
let isGameRunning = false;
let changingDirection = false; // Flag to prevent rapid direction changes

// --- Drawing Functions ---

/**
 * Draws a single tile on the canvas.
 */
function drawTile(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
}

/**
 * Renders the entire game state (snake and food).
 */
function drawGame() {
    // 1. Clear the entire canvas
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    // 2. Draw Food
    drawTile(food.x, food.y, 'red');

    // 3. Draw Snake
    snake.forEach((segment, index) => {
        // Head is a different color
        const color = index === 0 ? 'darkgreen' : 'lime';
        drawTile(segment.x, segment.y, color);
    });
}

// --- Game Logic ---

/**
 * Generates random coordinates for food, ensuring it doesn't spawn on the snake.
 */
function generateFood() {
    let newFood;
    do {
        // Generate coordinates aligned to the grid
        const x = Math.floor(Math.random() * GRID_SIZE) * TILE_SIZE;
        const y = Math.floor(Math.random() * GRID_SIZE) * TILE_SIZE;
        newFood = { x, y };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

/**
 * Moves the snake, checks for collisions, and handles eating food.
 */
function moveSnake() {
    changingDirection = false;
    
    // 1. Create the new head position
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // 2. Add the new head to the beginning of the snake array
    snake.unshift(head);

    // 3. Check for Game Over conditions
    if (checkCollision()) {
        endGame(false);
        return;
    }

    // 4. Check if food was eaten
    if (head.x === food.x && head.y === food.y) {
        // Food eaten: increase score and generate new food. DO NOT remove tail.
        score++;
        scoreDisplayEl.textContent = score;
        generateFood();
    } else {
        // Food not eaten: remove the tail segment (snake moves normally)
        snake.pop();
    }
}

/**
 * Checks for collision with walls or self.
 */
function checkCollision() {
    const head = snake[0];
    
    // Check collision with walls
    const hitWall = head.x < 0 || head.x >= canvasEl.width || 
                    head.y < 0 || head.y >= canvasEl.height;

    // Check collision with self (start check from the 4th segment)
    const hitSelf = snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);

    return hitWall || hitSelf;
}

// --- Game Control ---

/**
 * The main game loop function.
 */
function gameLoop() {
    if (!isGameRunning) return;

    moveSnake();
    drawGame();
}

/**
 * Starts the game.
 */
function startGame() {
    if (isGameRunning) return;
    
    // 1. Reset State
    isGameRunning = true;
    score = 0;
    scoreDisplayEl.textContent = 0;
    dx = TILE_SIZE;
    dy = 0;
    snake = [
        { x: 6 * TILE_SIZE, y: 10 * TILE_SIZE },
        { x: 5 * TILE_SIZE, y: 10 * TILE_SIZE },
        { x: 4 * TILE_SIZE, y: 10 * TILE_SIZE }
    ];
    
    // 2. Setup UI
    gameStatusEl.textContent = 'Playing...';
    gameStatusEl.classList.remove('bg-danger', 'bg-success');
    gameStatusEl.classList.add('bg-info');
    startBtnEl.disabled = true;

    // 3. Setup Food and Start Loop
    generateFood();
    drawGame(); // Initial draw
    
    gameLoopInterval = setInterval(gameLoop, GAME_SPEED);
}

/**
 * Ends the game.
 */
function endGame(win) {
    clearInterval(gameLoopInterval);
    isGameRunning = false;
    startBtnEl.disabled = false;
    
    if (win) {
        gameStatusEl.textContent = `You Win! Score: ${score}`;
        gameStatusEl.classList.remove('bg-info');
        gameStatusEl.classList.add('bg-success');
    } else {
        gameStatusEl.textContent = `Game Over! Score: ${score}`;
        gameStatusEl.classList.remove('bg-info');
        gameStatusEl.classList.add('bg-danger');
    }
}

// --- Event Handlers ---

/**
 * Changes the snake's direction based on keyboard input.
 */
function changeDirection(event) {
    if (!isGameRunning || changingDirection) return;

    const key = event.key;
    const goingUp = dy === -TILE_SIZE;
    const goingDown = dy === TILE_SIZE;
    const goingRight = dx === TILE_SIZE;
    const goingLeft = dx === -TILE_SIZE;

    // Set flag to true to prevent next direction change until after the snake moves
    changingDirection = true; 

    // Use event.key for modern key detection
    if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && !goingRight) {
        dx = -TILE_SIZE;
        dy = 0;
    } else if ((key === 'ArrowUp' || key === 'w' || key === 'W') && !goingDown) {
        dx = 0;
        dy = -TILE_SIZE;
    } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && !goingLeft) {
        dx = TILE_SIZE;
        dy = 0;
    } else if ((key === 'ArrowDown' || key === 's' || key === 'S') && !goingUp) {
        dx = 0;
        dy = TILE_SIZE;
    }
}

/**
 * Handles clicks from the on-screen mobile controls.
 */
function handleMobileControls(event) {
    const direction = event.currentTarget.dataset.direction;
    if (direction) {
        changeDirection({ key: direction }); // Simulate a keyboard event
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements and context
    canvasEl = document.getElementById('game-canvas');
    ctx = canvasEl.getContext('2d');
    scoreDisplayEl = document.getElementById('score-display');
    gameStatusEl = document.getElementById('game-status');
    startBtnEl = document.getElementById('start-btn');
    
    // 2. Attach listeners
    if (startBtnEl) {
        startBtnEl.addEventListener('click', startGame);
    }
    // Listen for keyboard input on the entire document
    document.addEventListener('keydown', changeDirection);

    // Attach listeners for mobile controls
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    if (btnUp) btnUp.addEventListener('click', () => changeDirection({ key: 'ArrowUp' }));
    if (btnDown) btnDown.addEventListener('click', () => changeDirection({ key: 'ArrowDown' }));
    if (btnLeft) btnLeft.addEventListener('click', () => changeDirection({ key: 'ArrowLeft' }));
    if (btnRight) btnRight.addEventListener('click', () => changeDirection({ key: 'ArrowRight' }));
    
    // 3. Initial setup (Draw the empty grid and food placeholder)
    generateFood();
    drawGame();
}

export function cleanup() {
    // Stop the game loop if it's running
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
    }
    
    // Remove listeners
    if (startBtnEl) {
        startBtnEl.removeEventListener('click', startGame);
    }
    document.removeEventListener('keydown', changeDirection);

    // Remove mobile control listeners
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    if (btnUp) btnUp.removeEventListener('click', () => changeDirection({ key: 'ArrowUp' }));
    if (btnDown) btnDown.removeEventListener('click', () => changeDirection({ key: 'ArrowDown' }));
    if (btnLeft) btnLeft.removeEventListener('click', () => changeDirection({ key: 'ArrowLeft' }));
    if (btnRight) btnRight.removeEventListener('click', () => changeDirection({ key: 'ArrowRight' }));
    
    // Reset state for a clean reload
    isGameRunning = false;
    snake = [];
}