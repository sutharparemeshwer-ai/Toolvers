// js/tools/space-invaders.js

// --- DOM Elements & Canvas ---
let canvas, ctx;
let scoreEl,
  livesEl,
  startScreen,
  gameOverScreen,
  startBtn,
  restartBtn,
  finalScoreEl;

// --- Game State ---
let animationFrameId;
let score = 0;
let lives = 3;
let gameRunning = false;
const keys = {};

// --- Game Objects ---
let player;
let projectiles = [];
let invaderGrid;
let invaderProjectiles = [];

class Player {
  constructor() {
    this.width = 50;
    this.height = 30;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 20;
    this.speed = 5;
    this.color = "#198754"; // Green spaceship
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    if (keys["ArrowLeft"] && this.x > 0) {
      this.x -= this.speed;
    }
    if (keys["ArrowRight"] && this.x < canvas.width - this.width) {
      this.x += this.speed;
    }
    this.draw();
  }
}

class Projectile {
  constructor(x, y, isPlayer = true) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 10;
    this.speed = isPlayer ? 7 : 5;
    this.color = isPlayer ? "#0dcaf0" : "#ffc107"; // Cyan for player, Yellow for invader
    this.direction = isPlayer ? -1 : 1;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.speed * this.direction;
    this.draw();
  }
}

class Invader {
  constructor(x, y) {
    this.width = 30;
    this.height = 30;
    this.x = x;
    this.y = y;
    this.color = "#dc3545"; // Red invaders
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class InvaderGrid {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 2, y: 0 };
    this.invaders = [];
    const columns = Math.floor(Math.random() * 5) + 5; // 5 to 9 columns
    const rows = Math.floor(Math.random() * 3) + 3; // 3 to 5 rows

    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        this.invaders.push(new Invader(c * 40, r * 40 + 50));
      }
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y = 0;

    const rightmostInvader = this.invaders.reduce(
      (max, inv) => (inv.x > max.x ? inv : max),
      this.invaders[0]
    );
    const leftmostInvader = this.invaders.reduce(
      (min, inv) => (inv.x < min.x ? inv : min),
      this.invaders[0]
    );

    if (
      rightmostInvader.x + this.position.x + rightmostInvader.width >
        canvas.width ||
      leftmostInvader.x + this.position.x < 0
    ) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30; // Move down
    }
  }
}

function shootProjectile(isPlayer = true) {
  if (isPlayer) {
    projectiles.push(
      new Projectile(player.x + player.width / 2 - 2.5, player.y)
    );
  } else {
    if (invaderGrid.invaders.length > 0) {
      const randomInvader =
        invaderGrid.invaders[
          Math.floor(Math.random() * invaderGrid.invaders.length)
        ];
      invaderProjectiles.push(
        new Projectile(
          randomInvader.x + invaderGrid.position.x + randomInvader.width / 2,
          randomInvader.y + invaderGrid.position.y + randomInvader.height,
          false
        )
      );
    }
  }
}

function handleCollisions() {
  // Player projectiles hitting invaders
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    for (let j = invaderGrid.invaders.length - 1; j >= 0; j--) {
      const invader = invaderGrid.invaders[j];
      const invaderX = invader.x + invaderGrid.position.x;
      const invaderY = invader.y + invaderGrid.position.y;

      if (
        p.x < invaderX + invader.width &&
        p.x + p.width > invaderX &&
        p.y < invaderY + invader.height &&
        p.y + p.height > invaderY
      ) {
        projectiles.splice(i, 1);
        invaderGrid.invaders.splice(j, 1);
        score += 10;
        scoreEl.textContent = score;
        break;
      }
    }
  }

  // Invader projectiles hitting player
  for (let i = invaderProjectiles.length - 1; i >= 0; i--) {
    const p = invaderProjectiles[i];
    if (
      p.x < player.x + player.width &&
      p.x + p.width > player.x &&
      p.y < player.y + player.height &&
      p.y + p.height > player.y
    ) {
      invaderProjectiles.splice(i, 1);
      lives--;
      livesEl.textContent = lives;
      if (lives <= 0) {
        endGame(false);
      }
      break;
    }
  }
}

function checkGameState() {
  // Win condition
  if (invaderGrid.invaders.length === 0) {
    endGame(true); // Win
  }

  // Lose condition
  const bottomInvader = invaderGrid.invaders.reduce(
    (max, inv) => (inv.y > max.y ? inv : max),
    { y: -1 }
  );
  if (
    bottomInvader.y !== -1 &&
    bottomInvader.y + invaderGrid.position.y + bottomInvader.height >= player.y
  ) {
    endGame(false); // Lose
  }
}

function gameLoop() {
  if (!gameRunning) return;
  animationFrameId = requestAnimationFrame(gameLoop);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

  projectiles.forEach((p, i) => {
    if (p.y + p.height < 0) projectiles.splice(i, 1);
    else p.update();
  });

  invaderProjectiles.forEach((p, i) => {
    if (p.y > canvas.height) invaderProjectiles.splice(i, 1);
    else p.update();
  });

  invaderGrid.update();
  invaderGrid.invaders.forEach((invader) => {
    invader.x += invaderGrid.position.x;
    invader.y += invaderGrid.position.y;
    invader.draw();
    invader.x -= invaderGrid.position.x; // Reset for next frame calculation
    invader.y -= invaderGrid.position.y;
  });

  // Randomly shoot from invaders
  if (Math.random() < 0.02) {
    shootProjectile(false);
  }

  handleCollisions();
  checkGameState();
}

function startGame() {
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  gameRunning = true;

  player = new Player();
  invaderGrid = new InvaderGrid();
  projectiles = [];
  invaderProjectiles = [];

  startScreen.classList.add("d-none");
  gameOverScreen.classList.add("d-none");

  gameLoop();
}

function endGame(isWin) {
  gameRunning = false;
  cancelAnimationFrame(animationFrameId);
  finalScoreEl.textContent = score;
  gameOverScreen.querySelector("h5").textContent = isWin
    ? "You Win!"
    : "Game Over";
  gameOverScreen.classList.remove("d-none");
}

const handleKeyDown = (e) => {
  keys[e.code] = true;
  if (e.code === "Space" && gameRunning) {
    e.preventDefault();
    shootProjectile(true);
  }
};

const handleKeyUp = (e) => {
  keys[e.code] = false;
};

export function init() {
  canvas = document.getElementById("invaders-canvas");
  ctx = canvas.getContext("2d");
  scoreEl = document.getElementById("invaders-score");
  livesEl = document.getElementById("invaders-lives");
  startScreen = document.getElementById("invaders-start-screen");
  gameOverScreen = document.getElementById("invaders-game-over-screen");
  startBtn = document.getElementById("invaders-start-btn");
  restartBtn = document.getElementById("invaders-restart-btn");
  finalScoreEl = document.getElementById("invaders-final-score");

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Initial draw
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function cleanup() {
  cancelAnimationFrame(animationFrameId);
  gameRunning = false;
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);
  startBtn.removeEventListener("click", startGame);
  restartBtn.removeEventListener("click", startGame);
}
