// js/tools/dino-game.js

let dinoEl, obstacleEl, scoreDisplay, statusDisplay, jumpBtn, groundEl;
let gameInterval, scoreInterval, obstacleTimeout;
let score = 0;
let isJumping = false;
let isGameOver = false;

const JUMP_DURATION = 600; 
const OBSTACLE_INTERVAL_MIN = 1500;
const OBSTACLE_INTERVAL_MAX = 3000;

// --- Core Game Functions ---

function jump() {
    if (isJumping || isGameOver) return;
    
    isJumping = true;
    dinoEl.classList.add('jump-animate');

    setTimeout(() => {
        dinoEl.classList.remove('jump-animate');
        isJumping = false;
    }, JUMP_DURATION);
}

function updateScore() {
    score++;
    scoreDisplay.textContent = score;
}

function checkCollision() {
    const dinoRect = dinoEl.getBoundingClientRect();
    const obstacleRect = obstacleEl.getBoundingClientRect();

    // Check collision only if the obstacle is currently visible (display !== 'none')
    if (obstacleEl.style.display !== 'none' && 
        dinoRect.right > obstacleRect.left &&
        dinoRect.left < obstacleRect.right &&
        dinoRect.bottom > obstacleRect.top
    ) {
        gameOver();
    }
}

function startGame() {
    score = 0;
    scoreDisplay.textContent = '0';
    isGameOver = false;
    
    // Reset visual state and start animations
    groundEl.style.animationPlayState = 'running';
    obstacleEl.style.animation = 'slideObstacle 1.5s linear infinite';
    obstacleEl.style.display = 'none'; // Keep hidden until first schedule

    statusDisplay.textContent = 'Running...';
    statusDisplay.classList.remove('game-over-text', 'text-danger');
    statusDisplay.classList.add('text-success');

    // Update mobile button text
    if (jumpBtn) {
        jumpBtn.innerHTML = '<i class="fa-solid fa-up-long"></i> JUMP';
    }

    // Clear previous intervals if any
    clearInterval(scoreInterval);
    clearInterval(gameInterval);
    clearTimeout(obstacleTimeout);
    
    scoreInterval = setInterval(updateScore, 100); 
    gameInterval = setInterval(checkCollision, 50);
    
    scheduleNewObstacle();
}

function scheduleNewObstacle() {
    
    const randomTime = Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN) + OBSTACLE_INTERVAL_MIN;

    obstacleTimeout = setTimeout(() => {
        if (isGameOver) return;

        // Force restart of CSS animation and ensure visibility
        obstacleEl.style.display = 'block'; // **Make it visible**
        
        // This forces the CSS animation to restart by toggling the name
        obstacleEl.style.animation = 'none';
        void obstacleEl.offsetWidth; // Trigger reflow
        obstacleEl.style.animation = 'slideObstacle 1.5s linear infinite'; 
        
        // Schedule the next one after the animation completes (1.5s)
        setTimeout(() => {
            if (!isGameOver) scheduleNewObstacle();
        }, 1500); 

    }, randomTime);
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    clearInterval(scoreInterval);
    clearTimeout(obstacleTimeout);
    
    // Stop all movement
    obstacleEl.style.animationPlayState = 'paused';
    groundEl.style.animationPlayState = 'paused';
    obstacleEl.style.display = 'none'; // Hide the obstacle that caused Game Over

    statusDisplay.textContent = `GAME OVER! Press ENTER to restart. Final Score: ${score}`;
    statusDisplay.classList.remove('text-success');
    statusDisplay.classList.add('game-over-text', 'text-danger');

    // Update mobile button text
    if (jumpBtn) {
        jumpBtn.textContent = 'Restart Game';
    }
}

// --- Event Handlers ---

function handleKeydown(e) {
    // Only block default space/enter actions within the tool
    if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault(); 
    }
    
    if (e.code === 'Enter') {
        if (isGameOver) {
            startGame(); // START on Enter
        }
    } else if (e.code === 'Space') {
        jump(); // JUMP on Space
    }
}

function handleJumpClick() {
    if (isGameOver) {
        startGame();
    } else {
        jump();
    }
}


// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    dinoEl = document.getElementById('dino');
    obstacleEl = document.getElementById('obstacle');
    scoreDisplay = document.getElementById('score-display');
    statusDisplay = document.getElementById('game-status');
    jumpBtn = document.getElementById('jump-btn');
    groundEl = document.getElementById('ground');

    // 2. Attach Listeners
    document.addEventListener('keydown', handleKeydown);
    if (jumpBtn) jumpBtn.addEventListener('click', handleJumpClick);
    
    // 3. Initialize state
    isGameOver = true; 
    statusDisplay.textContent = 'Press ENTER to Start! SPACE to Jump.';
    groundEl.style.animationPlayState = 'paused'; 
    if (jumpBtn) {
        jumpBtn.textContent = 'Start Game';
    }
    obstacleEl.style.display = 'none'; // Initial state hidden
}

export function cleanup() {
    clearInterval(gameInterval);
    clearInterval(scoreInterval);
    clearTimeout(obstacleTimeout);
    isJumping = false;
    isGameOver = false;
    score = 0;
    
    document.removeEventListener('keydown', handleKeydown);
    if (jumpBtn) jumpBtn.removeEventListener('click', handleJumpClick);
    
    if(scoreDisplay) scoreDisplay.textContent = '0';
    if(statusDisplay) statusDisplay.textContent = 'Ready';
    if(obstacleEl) obstacleEl.style.display = 'none'; // Hide on cleanup
    if(groundEl) groundEl.style.animationPlayState = 'paused';
}