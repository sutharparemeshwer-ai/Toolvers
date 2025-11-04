// js/tools/brick-breaker.js

// --- DOM Elements & Canvas ---
let canvas, ctx;
let scoreEl, livesEl;
let startScreen, gameOverScreen, winScreen;
let startBtn, restartBtn, playAgainBtn;
let finalScoreEl, winScoreEl;

// --- Game State ---
let animationFrameId;
let score = 0;
let lives = 3;
let gameRunning = false;

// --- Ball Properties ---
const ball = {
  x: 400,
  y: 300,
  dx: 4,
  dy: -4,
  radius: 10,
  speed: 4,
};

// --- Paddle Properties ---
const paddle = {
  x: 350,
  y: 560,
  width: 100,
  height: 10,
  speed: 8,
  dx: 0,
};

// --- Brick Properties ---
const brickInfo = {
  rowCount: 5,
  columnCount: 9,
  width: 75,
  height: 20,
  padding: 10,
  offsetTop: 40,
  offsetLeft: 30,
};
let bricks = [];

// --- Event State ---
const keysPressed = {};

// --- Game Logic ---

function createBricks() {
  bricks = [];
  for (let c = 0; c < brickInfo.columnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickInfo.rowCount; r++) {
      const brickX =
        c * (brickInfo.width + brickInfo.padding) + brickInfo.offsetLeft;
      const brickY =
        r * (brickInfo.height + brickInfo.padding) + brickInfo.offsetTop;
      bricks[c][r] = { x: brickX, y: brickY, status: 1 };
    }
  }
}

function movePaddle() {
  paddle.x += paddle.dx;

  // Wall detection
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) {
    paddle.x = canvas.width - paddle.width;
  }
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision (left/right)
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }

  // Wall collision (top)
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Paddle collision
  if (
    ball.y + ball.radius > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ball.dy = -ball.speed;
  }

  // Bottom wall collision (lose life)
  if (ball.y + ball.radius > canvas.height) {
    lives--;
    livesEl.textContent = lives;
    if (lives === 0) {
      endGame(false);
    } else {
      resetBallAndPaddle();
    }
  }

  // Brick collision
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.status === 1) {
        if (
          ball.x > brick.x &&
          ball.x < brick.x + brickInfo.width &&
          ball.y > brick.y &&
          ball.y < brick.y + brickInfo.height
        ) {
          ball.dy *= -1;
          brick.status = 0;
          score++;
          scoreEl.textContent = score;
          checkWin();
        }
      }
    });
  });
}

function checkWin() {
  const totalBricks = brickInfo.rowCount * brickInfo.columnCount;
  if (score % totalBricks === 0 && score > 0) {
    endGame(true);
  }
}

function resetBallAndPaddle() {
  ball.x = canvas.width / 2;
  ball.y = paddle.y - 30;
  ball.dx = ball.speed * (Math.random() < 0.5 ? 1 : -1);
  ball.dy = -ball.speed;
  paddle.x = (canvas.width - paddle.width) / 2;
}

// --- Drawing Functions ---

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#0d6efd";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = "#343a40";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.status === 1) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brickInfo.width, brickInfo.height);
        ctx.fillStyle = "#198754";
        ctx.fill();
        ctx.closePath();
      }
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
}

// --- Game Loop ---

function gameLoop() {
  movePaddle();
  moveBall();
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
}

// --- Game Control ---

function startGame() {
  gameRunning = true;
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  startScreen.classList.add("d-none");
  gameOverScreen.classList.add("d-none");
  winScreen.classList.add("d-none");
  createBricks();
  resetBallAndPaddle();
  gameLoop();
}

function endGame(isWin) {
  gameRunning = false;
  cancelAnimationFrame(animationFrameId);
  if (isWin) {
    winScoreEl.textContent = score;
    winScreen.classList.remove("d-none");
  } else {
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove("d-none");
  }
}

// --- Event Handlers ---

const handleKeyDown = (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
  }
};

const handleKeyUp = (e) => {
  if (
    e.key === "Right" ||
    e.key === "ArrowRight" ||
    e.key === "Left" ||
    e.key === "ArrowLeft"
  ) {
    paddle.dx = 0;
  }
};

const handleMouseMove = (e) => {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddle.x = relativeX - paddle.width / 2;
  }
};

// --- Router Hooks ---

export function init() {
  canvas = document.getElementById("brick-breaker-canvas");
  ctx = canvas.getContext("2d");
  scoreEl = document.getElementById("brick-breaker-score");
  livesEl = document.getElementById("brick-breaker-lives");
  startScreen = document.getElementById("brick-breaker-start-screen");
  gameOverScreen = document.getElementById("brick-breaker-game-over-screen");
  winScreen = document.getElementById("brick-breaker-win-screen");
  startBtn = document.getElementById("brick-breaker-start-btn");
  restartBtn = document.getElementById("brick-breaker-restart-btn");
  playAgainBtn = document.getElementById("brick-breaker-play-again-btn");
  finalScoreEl = document.getElementById("brick-breaker-final-score");
  winScoreEl = document.getElementById("brick-breaker-win-score");

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", startGame);

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  document.addEventListener("mousemove", handleMouseMove);

  draw(); // Initial draw to show paddle
}

export function cleanup() {
  cancelAnimationFrame(animationFrameId);
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);
  document.removeEventListener("mousemove", handleMouseMove);
  startBtn.removeEventListener("click", startGame);
  restartBtn.removeEventListener("click", startGame);
  playAgainBtn.removeEventListener("click", startGame);
}
