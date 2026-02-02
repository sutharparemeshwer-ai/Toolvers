// js/tools/pong-game.js

let canvas, ctx, loop;
let p1Score = 0, p2Score = 0;
let ball = { x: 400, y: 200, dx: 5, dy: 5, r: 8 };
let p1 = { y: 150, h: 80, w: 10 };
let p2 = { y: 150, h: 80, w: 10 };
const PADDLE_SPEED = 8;
const keys = {};

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 10;
}

function update() {
    // P1 Move
    if(keys['KeyW'] && p1.y > 0) p1.y -= PADDLE_SPEED;
    if(keys['KeyS'] && p1.y < canvas.height - p1.h) p1.y += PADDLE_SPEED;
    
    // P2 Move (AI or Player)
    if(keys['ArrowUp'] && p2.y > 0) p2.y -= PADDLE_SPEED;
    if(keys['ArrowDown'] && p2.y < canvas.height - p2.h) p2.y += PADDLE_SPEED;

    // Ball Physics
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top/Bottom
    if(ball.y < 0 || ball.y > canvas.height) ball.dy *= -1;

    // Paddle Collisions
    if(ball.x < 20 && ball.y > p1.y && ball.y < p1.y + p1.h) {
        ball.dx = Math.abs(ball.dx) * 1.1; // Speed up
        ball.dy += (Math.random() - 0.5) * 2;
    }
    if(ball.x > canvas.width - 20 && ball.y > p2.y && ball.y < p2.y + p2.h) {
        ball.dx = -Math.abs(ball.dx) * 1.1;
        ball.dy += (Math.random() - 0.5) * 2;
    }

    // Scoring
    if(ball.x < 0) { p2Score++; resetBall(); }
    if(ball.x > canvas.width) { p1Score++; resetBall(); }

    render();
}

function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glow Effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#0ff';
    
    ctx.fillStyle = '#0ff';
    ctx.fillRect(10, p1.y, p1.w, p1.h);
    ctx.fillRect(canvas.width - 20, p2.y, p2.w, p2.h);
    
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    document.getElementById('p1-score').textContent = p1Score;
    document.getElementById('p2-score').textContent = p2Score;
}

export function init() {
    canvas = document.getElementById('pong-canvas');
    ctx = canvas.getContext('2d');
    
    document.getElementById('start-btn').onclick = () => {
        if(loop) clearInterval(loop);
        p1Score = 0; p2Score = 0;
        resetBall();
        loop = setInterval(update, 1000/60);
    };

    window.onkeydown = (e) => keys[e.code] = true;
    window.onkeyup = (e) => keys[e.code] = false;
    
    render();
}

export function cleanup() {
    clearInterval(loop);
    window.onkeydown = null;
    window.onkeyup = null;
}
