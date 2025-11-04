// js/tools/flappy-bird.js

// --- DOM Elements ---
let canvas, ctx;
let startScreen, gameOverScreen, startBtn, restartBtn, finalScoreEl;

// --- Game State & Constants ---
let gameState = "ready"; // 'ready', 'playing', 'over'
let score = 0;
let frame = 0;
let animationFrameId;

const GRAVITY = 0.15;
const FLAP_STRENGTH = -4.6;
const PIPE_SPEED = 2;
const PIPE_GAP = 120;
const PIPE_INTERVAL = 90; // Frames between new pipes

// --- Game Objects ---
const bird = {
  x: 50,
  y: 150,
  radius: 12,
  velocity: 0,
  draw() {
    // Save the current context state
    ctx.save();
    // Translate context to the bird's position for easier drawing
    ctx.translate(this.x, this.y);

    // Add a dynamic tilt based on the bird's velocity
    const angle = (Math.PI / 6) * (this.velocity / 8); // Tilt up to 30 degrees
    ctx.rotate(angle);

    // Main Body (Yellow)
    ctx.fillStyle = "#FFC107";
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Wing (Slightly darker yellow)
    ctx.fillStyle = "#F39C12";
    ctx.beginPath();
    ctx.arc(-4, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eye (Black)
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(4, -3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Restore the context to its original state
  },
  update() {
    this.velocity += GRAVITY;
    this.y += this.velocity;

    // Prevent bird from going off the top
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.velocity = 0;
    }

    // Check for ground collision
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.velocity = 0;
      setGameOver();
    }
  },
  flap() {
    this.velocity = FLAP_STRENGTH;
  },
  reset() {
    this.y = 150;
    this.velocity = 0;
  },
};

let pipes = [];

function drawPipes() {
  ctx.fillStyle = "#28a745"; // Green pipes
  pipes.forEach((pipe) => {
    // Top pipe
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
    // Bottom pipe
    ctx.fillRect(
      pipe.x,
      pipe.topHeight + PIPE_GAP,
      pipe.width,
      canvas.height - (pipe.topHeight + PIPE_GAP)
    );
  });
}

function updatePipes() {
  if (frame % PIPE_INTERVAL === 0) {
    const topHeight = Math.random() * (canvas.height - PIPE_GAP - 150) + 75;
    pipes.push({
      x: canvas.width,
      width: 50,
      topHeight: topHeight,
      passed: false,
    });
  }

  pipes.forEach((pipe) => {
    pipe.x -= PIPE_SPEED;

    // Scoring
    if (!pipe.passed && pipe.x + pipe.width < bird.x) {
      score++;
      pipe.passed = true;
    }

    // Collision detection
    if (
      bird.x + bird.radius > pipe.x &&
      bird.x - bird.radius < pipe.x + pipe.width &&
      (bird.y - bird.radius < pipe.topHeight ||
        bird.y + bird.radius > pipe.topHeight + PIPE_GAP)
    ) {
      setGameOver();
    }
  });

  // Remove off-screen pipes
  pipes = pipes.filter((pipe) => pipe.x + pipe.width > 0);
}

// --- Game Loop & State Management ---

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "playing") {
    bird.update();
    updatePipes();
    frame++;
  }

  bird.draw();
  drawPipes();

  // Draw score
  ctx.fillStyle = "#FFF";
  ctx.font = "30px Poppins";
  ctx.fillText(score, canvas.width / 2, 50);

  animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
  gameState = "playing";
  startScreen.classList.add("d-none");
  gameOverScreen.classList.add("d-none");
  bird.reset();
  pipes = [];
  score = 0;
  frame = 0;
}

function setGameOver() {
  gameState = "over";
  finalScoreEl.textContent = score;
  gameOverScreen.classList.remove("d-none");
}

function handleInput() {
  if (gameState === "playing") {
    bird.flap();
  }
}

function handleKeyPress(e) {
  if (e.code === "Space") {
    handleInput();
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  canvas = document.getElementById("flappy-bird-canvas");
  ctx = canvas.getContext("2d");
  startScreen = document.getElementById("flappy-start-screen");
  gameOverScreen = document.getElementById("flappy-game-over-screen");
  startBtn = document.getElementById("flappy-start-btn");
  restartBtn = document.getElementById("flappy-restart-btn");
  finalScoreEl = document.getElementById("flappy-final-score");

  // Set initial background
  ctx.fillStyle = "#87CEEB"; // Sky blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Attach event listeners
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  canvas.addEventListener("click", handleInput);
  window.addEventListener("keydown", handleKeyPress);

  // Start the game loop (it will only update based on gameState)
  gameLoop();
}

export function cleanup() {
  // Stop the game loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // Remove event listeners
  startBtn.removeEventListener("click", startGame);
  restartBtn.removeEventListener("click", startGame);
  if (canvas) canvas.removeEventListener("click", handleInput);
  window.removeEventListener("keydown", handleKeyPress);
}
