// js/tools/brick-breaker.js

let canvas, ctx, loop;
let score = 0, playing = false;
const paddle = { x: 350, w: 100, h: 10 };
const ball = { x: 400, y: 450, dx: 4, dy: -4, r: 7 };
const bricks = [];
const COLS = 8, ROWS = 5;

function setupBricks() {
    bricks.length = 0;
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            bricks.push({ x: c*95 + 45, y: r*30 + 50, w: 80, h: 20, color: colors[r], active: true });
        }
    }
}

function update() {
    if(!playing) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Walls
    if(ball.x < 0 || ball.x > canvas.width) ball.dx *= -1;
    if(ball.y < 0) ball.dy *= -1;
    
    // Paddle
    if(ball.y > canvas.height - 25 && ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
        ball.dy = -Math.abs(ball.dy);
        // Angle based on hit position
        const diff = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
        ball.dx = diff * 8;
    }

    // Bricks
    bricks.forEach(b => {
        if(b.active && ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
            b.active = false;
            ball.dy *= -1;
            score += 10;
            document.getElementById('br-score').textContent = score;
        }
    });

    // Game Over
    if(ball.y > canvas.height) {
        playing = false;
        document.getElementById('br-overlay').classList.remove('d-none');
    }

    render();
    loop = requestAnimationFrame(update);
}

function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Paddle
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, canvas.height - 20, paddle.w, paddle.h);

    // Ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fill();

    // Bricks
    bricks.forEach(b => {
        if(b.active) {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.w, b.h);
        }
    });
}

export function init() {
    canvas = document.getElementById('br-canvas');
    ctx = canvas.getContext('2d');
    
    document.getElementById('br-start').onclick = () => {
        score = 0;
        document.getElementById('br-score').textContent = 0;
        ball.x = 400; ball.y = 450; ball.dx = 4; ball.dy = -4;
        setupBricks();
        playing = true;
        document.getElementById('br-overlay').classList.add('d-none');
        update();
    };

    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        paddle.x = (e.clientX - rect.left) * (canvas.width / rect.width) - paddle.w/2;
    };
    
    render();
}

export function cleanup() {
    cancelAnimationFrame(loop);
}