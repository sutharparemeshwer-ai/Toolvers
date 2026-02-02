// js/tools/dino.js

let canvas, ctx;
let gameLoop;
let isPlaying = false;
let score = 0;
let speed = 6;
let frames = 0;
let highScore = localStorage.getItem('dino_highscore') || 0;
let nextSpawnDistance = 0; // Tracks when the next obstacle should spawn

const config = {
    gravity: 0.6,
    jumpPower: -12,
    groundY: 210,
    dinoX: 50,
    startSpeed: 6,
    maxSpeed: 15
};

const dino = {
    x: config.dinoX,
    y: config.groundY,
    w: 44,
    h: 47,
    dy: 0,
    grounded: true,
    legFrame: 0
};

let obstacles = [];
let clouds = [];

function drawDino() {
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
    ctx.fillRect(dino.x + 20, dino.y - 15, 30, 25);
    ctx.fillStyle = '#fff';
    ctx.fillRect(dino.x + 40, dino.y - 10, 4, 4);
    
    ctx.fillStyle = '#535353';
    if (!dino.grounded) {
        ctx.fillRect(dino.x + 5, dino.y + dino.h, 10, 10);
        ctx.fillRect(dino.x + 25, dino.y + dino.h, 10, 10);
    } else {
        const legY = dino.y + dino.h;
        if (dino.legFrame < 5) {
            ctx.fillRect(dino.x + 5, legY, 10, 10);
        } else {
            ctx.fillRect(dino.x + 25, legY, 10, 10);
        }
    }
}

function drawObstacles() {
    ctx.fillStyle = '#535353';
    obstacles.forEach(obs => {
        // Draw main body
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        
        // Draw arms for "cactus" look if it's tall enough
        if (obs.h > 30) {
            ctx.fillRect(obs.x - 5, obs.y + 10, 5, 15); 
            ctx.fillRect(obs.x + obs.w, obs.y + 5, 5, 20);
        }
        
        obs.x -= speed;
    });
    
    if (obstacles.length && obstacles[0].x < -100) obstacles.shift();
}

function drawEnvironment() {
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, config.groundY + dino.h + 10);
    ctx.lineTo(canvas.width, config.groundY + dino.h + 10);
    ctx.stroke();

    ctx.fillStyle = '#d3d3d3';
    clouds.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 15, 0, Math.PI * 2);
        ctx.arc(c.x + 15, c.y - 10, 20, 0, Math.PI * 2);
        ctx.arc(c.x + 35, c.y, 15, 0, Math.PI * 2);
        ctx.fill();
        c.x -= speed * 0.2;
    });
    
    if (clouds.length && clouds[0].x < -100) clouds.shift();
    if (frames % 100 === 0) clouds.push({ x: canvas.width + 50, y: 40 + Math.random() * 60 });
}

function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const isNight = Math.floor(score / 500) % 2 === 1;
    document.getElementById('dino-game-wrapper').style.background = isNight ? '#202124' : '#fff';
    ctx.filter = isNight ? 'invert(100%)' : 'none';

    drawEnvironment();

    dino.dy += config.gravity;
    dino.y += dino.dy;

    if (dino.y > config.groundY) {
        dino.y = config.groundY;
        dino.dy = 0;
        dino.grounded = true;
    }

    dino.legFrame = (dino.legFrame + 1) % 10;

    drawDino();
    
    // --- Advanced Spawning Logic ---
    frames++;
    
    // Calculate distance from the last obstacle
    let distanceToLast = 0;
    if (obstacles.length > 0) {
        distanceToLast = canvas.width - (obstacles[obstacles.length - 1].x + obstacles[obstacles.length - 1].w);
    } else {
        distanceToLast = canvas.width; // Treat start as far away
    }

    // Spawn if we exceeded the random gap
    if (distanceToLast > nextSpawnDistance) {
        spawnObstacle();
        // Set next random gap (between 250px and 600px, scaling with speed)
        nextSpawnDistance = Math.floor(Math.random() * 350) + 250 + (speed * 10);
    }

    drawObstacles();

    if (frames % 5 === 0) {
        score++;
        document.getElementById('curr-score').textContent = String(score).padStart(5, '0');
        if (score % 100 === 0 && speed < config.maxSpeed) speed += 0.5;
    }

    checkCollision();
    gameLoop = requestAnimationFrame(update);
}

function spawnObstacle() {
    const type = Math.random();
    let width, height, yPos;

    if (type < 0.33) {
        // Small Single
        width = 20; height = 35;
    } else if (type < 0.66) {
        // Large Single
        width = 25; height = 50;
    } else {
        // Cluster (Wide)
        width = 45; height = 35;
    }
    
    // Align bottom to ground
    yPos = (config.groundY + dino.h) - height + 10; 

    obstacles.push({
        x: canvas.width,
        y: yPos,
        w: width,
        h: height
    });
}

function checkCollision() {
    const hitBoxPadding = 8;
    obstacles.forEach(obs => {
        if (dino.x + hitBoxPadding < obs.x + obs.w &&
            dino.x + dino.w - hitBoxPadding > obs.x &&
            dino.y + hitBoxPadding < obs.y + obs.h &&
            dino.y + dino.h - hitBoxPadding > obs.y) {
            gameOver();
        }
    });
}

function jump() {
    if (dino.grounded && isPlaying) {
        dino.dy = config.jumpPower;
        dino.grounded = false;
    }
}

function start() {
    isPlaying = true;
    score = 0;
    speed = config.startSpeed;
    obstacles = [];
    clouds = [];
    frames = 0;
    nextSpawnDistance = 0; // Reset spawn timer
    document.getElementById('start-overlay').classList.add('d-none');
    document.getElementById('game-over-overlay').classList.add('d-none');
    document.getElementById('hi-score').textContent = String(highScore).padStart(5, '0');
    update();
}

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameLoop);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dino_highscore', highScore);
    }
    document.getElementById('game-over-overlay').classList.remove('d-none');
}

function handleInput(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (isPlaying) jump();
        else start();
    }
}

export function init() {
    canvas = document.getElementById('dino-canvas');
    ctx = canvas.getContext('2d');
    
    document.getElementById('start-btn').onclick = start;
    document.getElementById('restart-btn').onclick = start;
    document.addEventListener('keydown', handleInput);
    
    canvas.onclick = () => {
        if (isPlaying) jump();
        else if (document.getElementById('start-overlay').classList.contains('d-none') === false || 
                 document.getElementById('game-over-overlay').classList.contains('d-none') === false) {
            start();
        }
    };

    document.getElementById('hi-score').textContent = String(highScore).padStart(5, '0');
}

export function cleanup() {
    cancelAnimationFrame(gameLoop);
    document.removeEventListener('keydown', handleInput);
}
