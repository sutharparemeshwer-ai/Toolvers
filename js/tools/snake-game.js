// js/tools/snake-game.js

let canvas, ctx, scoreEl, statusEl, startBtn;
const TILE = 20;
let GRID_W, GRID_H;
let snake = [], food = {}, dx = 0, dy = 0, score = 0, loop = null;

function initGame() {
    GRID_W = canvas.width / TILE;
    GRID_H = canvas.height / TILE;
    snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    dx = 1; dy = 0;
    score = 0;
    scoreEl.textContent = 0;
    statusEl.textContent = 'PLAYING';
    placeFood();
    
    if (loop) clearInterval(loop);
    loop = setInterval(update, 100);
    startBtn.disabled = true;
    startBtn.textContent = 'RUNNING...';
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * GRID_W),
        y: Math.floor(Math.random() * GRID_H)
    };
    // Don't spawn on snake
    if(snake.some(s => s.x === food.x && s.y === food.y)) placeFood();
}

function update() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Wall Collision
    if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H || 
        snake.some(s => s.x === head.x && s.y === head.y)) {
        return gameOver();
    }

    snake.unshift(head);

    // Eat Food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        placeFood();
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Food
    ctx.fillStyle = '#ff0055';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0055';
    ctx.fillRect(food.x * TILE + 1, food.y * TILE + 1, TILE - 2, TILE - 2);
    ctx.shadowBlur = 0;

    // Snake
    ctx.fillStyle = '#00ff00';
    snake.forEach(s => {
        ctx.fillRect(s.x * TILE + 1, s.y * TILE + 1, TILE - 2, TILE - 2);
    });
}

function gameOver() {
    clearInterval(loop);
    statusEl.textContent = 'GAME OVER';
    statusEl.classList.add('text-danger');
    startBtn.disabled = false;
    startBtn.textContent = 'RESTART';
    
    // Flash effect
    canvas.style.opacity = 0.5;
    setTimeout(() => canvas.style.opacity = 1, 100);
}

function handleKey(e) {
    // Prevent reverse
    const k = e.key;
    if (k === 'ArrowUp' && dy !== 1) { dx=0; dy=-1; }
    if (k === 'ArrowDown' && dy !== -1) { dx=0; dy=1; }
    if (k === 'ArrowLeft' && dx !== 1) { dx=-1; dy=0; }
    if (k === 'ArrowRight' && dx !== -1) { dx=1; dy=0; }
}

export function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    scoreEl = document.getElementById('score-display');
    statusEl = document.getElementById('game-status');
    startBtn = document.getElementById('start-btn');

    startBtn.addEventListener('click', initGame);
    document.addEventListener('keydown', handleKey);

    // Mobile
    document.getElementById('btn-up').onclick = () => handleKey({key: 'ArrowUp'});
    document.getElementById('btn-down').onclick = () => handleKey({key: 'ArrowDown'});
    document.getElementById('btn-left').onclick = () => handleKey({key: 'ArrowLeft'});
    document.getElementById('btn-right').onclick = () => handleKey({key: 'ArrowRight'});

    // Initial Draw
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function cleanup() {
    if (loop) clearInterval(loop);
    document.removeEventListener('keydown', handleKey);
}
