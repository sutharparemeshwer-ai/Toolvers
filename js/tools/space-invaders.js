// js/tools/space-invaders.js

let canvas, ctx, loop;
let score = 0, playing = false;
let player = { x: 400, w: 40, h: 20 };
let bullets = [], enemies = [];
const keys = {};

function setupEnemies() {
    enemies = [];
    for(let r=0; r<4; r++) {
        for(let c=0; c<10; c++) {
            enemies.push({ x: c*60 + 100, y: r*40 + 50, w: 30, h: 20, dir: 1 });
        }
    }
}

function update() {
    if(!playing) return;

    if(keys['ArrowLeft'] && player.x > 0) player.x -= 5;
    if(keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += 5;

    // Bullets
    bullets.forEach((b, bi) => {
        b.y -= 8;
        if(b.y < 0) bullets.splice(bi, 1);
        
        // Hit detection
        enemies.forEach((e, ei) => {
            if(b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
                score += 100;
                document.getElementById('inv-score').textContent = score;
            }
        });
    });

    // Enemies
    let sideHit = false;
    enemies.forEach(e => {
        e.x += e.dir * 2;
        if(e.x < 0 || e.x > canvas.width - e.w) sideHit = true;
    });

    if(sideHit) {
        enemies.forEach(e => {
            e.dir *= -1;
            e.y += 20;
            if(e.y > canvas.height - 50) gameOver();
        });
    }

    if(enemies.length === 0) setupEnemies();

    render();
    loop = requestAnimationFrame(update);
}

function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Player (Vector)
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, canvas.height - 30, player.w, player.h);

    // Bullets
    ctx.fillStyle = '#0ff';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 2, 10));

    // Enemies
    ctx.strokeStyle = '#f0f';
    enemies.forEach(e => {
        ctx.strokeRect(e.x, e.y, e.w, e.h);
        // Tiny antenna
        ctx.beginPath();
        ctx.moveTo(e.x + 15, e.y);
        ctx.lineTo(e.x + 15, e.y - 5);
        ctx.stroke();
    });
}

function gameOver() {
    playing = false;
    document.getElementById('inv-overlay').classList.remove('d-none');
}

export function init() {
    canvas = document.getElementById('inv-canvas');
    ctx = canvas.getContext('2d');
    
    document.getElementById('inv-start').onclick = () => {
        score = 0;
        document.getElementById('inv-score').textContent = 0;
        setupEnemies();
        playing = true;
        document.getElementById('inv-overlay').classList.add('d-none');
        update();
    };

    window.onkeydown = (e) => {
        keys[e.code] = true;
        if(e.code === 'Space' && playing) bullets.push({ x: player.x + 20, y: canvas.height - 40 });
    };
    window.onkeyup = (e) => keys[e.code] = false;
    
    render();
}

export function cleanup() {
    cancelAnimationFrame(loop);
    window.onkeydown = null;
}