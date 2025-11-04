// js/tools/asteroids.js

let canvas, ctx, animationFrameId;
let startScreen, gameOverScreen, startBtn, restartBtn;
let scoreEl, livesEl, finalScoreEl;

let gameState = "ready"; // ready, playing, over
let score = 0;
let lives = 3;
let keys = {};

const SHIP_SIZE = 15;
const SHIP_THRUST = 0.1;
const SHIP_TURN_SPEED = 0.1;
const FRICTION = 0.99;
const BULLET_SPEED = 7;
const ASTEROID_SPEED = 1;
const ASTEROID_SIZES = { large: 40, medium: 20, small: 10 };
const ASTEROID_POINTS = { large: 20, medium: 50, small: 100 };

let ship, bullets, asteroids;

function resetGame() {
  score = 0;
  lives = 3;
  ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: SHIP_SIZE,
    angle: 0,
    velocity: { x: 0, y: 0 },
    thrusting: false,
    invincible: true,
    invincibilityFrames: 180, // 3 seconds at 60fps
  };
  bullets = [];
  asteroids = [];
  for (let i = 0; i < 5; i++) {
    spawnAsteroid();
  }
  updateUI();
}

function startGame() {
  resetGame();
  gameState = "playing";
  startScreen.classList.add("d-none");
  gameOverScreen.classList.add("d-none");
}

function setGameOver() {
  gameState = "over";
  finalScoreEl.textContent = score;
  gameOverScreen.classList.remove("d-none");
}

function updateUI() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

function spawnAsteroid(x, y, size = "large") {
  const level = ASTEROID_SIZES[size];
  const numVertices = Math.floor(Math.random() * 6) + 10; // 10 to 15 vertices
  const vertices = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    // Randomize radius for a jagged look, between 80% and 120% of the base radius
    const radius = level * (0.8 + Math.random() * 0.4);
    vertices.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  asteroids.push({
    x: x || Math.random() * canvas.width,
    y: y || Math.random() * canvas.height,
    radius: level,
    size: size,
    angle: 0, // This will be the asteroid's rotation angle
    rotationSpeed: (Math.random() - 0.5) * 0.02, // Random rotation speed and direction
    velocity: {
      x: Math.random() * ASTEROID_SPEED * (Math.random() < 0.5 ? 1 : -1),
      y: Math.random() * ASTEROID_SPEED * (Math.random() < 0.5 ? 1 : -1),
    },
    vertices: vertices,
  });
}

function handleKeyDown(e) {
  keys[e.code] = true;
}

function handleKeyUp(e) {
  keys[e.code] = false;
  if (e.code === "Space" && gameState === "playing") {
    bullets.push({
      x: ship.x + Math.cos(ship.angle) * SHIP_SIZE,
      y: ship.y + Math.sin(ship.angle) * SHIP_SIZE,
      angle: ship.angle,
      velocity: {
        x: Math.cos(ship.angle) * BULLET_SPEED,
        y: Math.sin(ship.angle) * BULLET_SPEED,
      },
      lifespan: 60, // 1 second
    });
  }
}

function update() {
  // Ship movement
  ship.thrusting = keys["ArrowUp"];
  if (keys["ArrowRight"]) ship.angle += SHIP_TURN_SPEED;
  if (keys["ArrowLeft"]) ship.angle -= SHIP_TURN_SPEED;

  if (ship.thrusting) {
    ship.velocity.x += Math.cos(ship.angle) * SHIP_THRUST;
    ship.velocity.y += Math.sin(ship.angle) * SHIP_THRUST;
  }

  ship.velocity.x *= FRICTION;
  ship.velocity.y *= FRICTION;
  ship.x += ship.velocity.x;
  ship.y += ship.velocity.y;

  // Screen wrapping
  wrap(ship);
  bullets.forEach(wrap);
  asteroids.forEach(wrap);

  // Update bullets
  bullets.forEach((bullet, index) => {
    bullet.x += bullet.velocity.x;
    bullet.y += bullet.velocity.y;
    bullet.lifespan--;
    if (bullet.lifespan <= 0) bullets.splice(index, 1);
  });

  // Update asteroids
  asteroids.forEach((asteroid) => {
    asteroid.x += asteroid.velocity.x;
    asteroid.y += asteroid.velocity.y;
    asteroid.angle += asteroid.rotationSpeed;
  });

  // Collision detection
  handleCollisions();

  // Ship invincibility
  if (ship.invincible) {
    ship.invincibilityFrames--;
    if (ship.invincibilityFrames <= 0) {
      ship.invincible = false;
    }
  }
}

function handleCollisions() {
  // Bullet-Asteroid collision
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const bullet = bullets[i];
      const asteroid = asteroids[j];
      if (isColliding(bullet, asteroid)) {
        bullets.splice(i, 1);
        score += ASTEROID_POINTS[asteroid.size];

        if (asteroid.size === "large") {
          spawnAsteroid(asteroid.x, asteroid.y, "medium");
          spawnAsteroid(asteroid.x, asteroid.y, "medium");
        } else if (asteroid.size === "medium") {
          spawnAsteroid(asteroid.x, asteroid.y, "small");
          spawnAsteroid(asteroid.x, asteroid.y, "small");
        }
        asteroids.splice(j, 1);
        updateUI();
        break; // Move to next bullet
      }
    }
  }

  // Ship-Asteroid collision
  if (!ship.invincible) {
    for (let i = asteroids.length - 1; i >= 0; i--) {
      if (isColliding(ship, asteroids[i])) {
        lives--;
        updateUI();
        if (lives <= 0) {
          setGameOver();
        } else {
          // Respawn ship
          ship.x = canvas.width / 2;
          ship.y = canvas.height / 2;
          ship.velocity = { x: 0, y: 0 };
          ship.invincible = true;
          ship.invincibilityFrames = 180;
        }
        break;
      }
    }
  }

  if (asteroids.length === 0) {
    // Next level
    for (let i = 0; i < 5 + Math.floor(score / 1000); i++) {
      spawnAsteroid();
    }
  }
}

function isColliding(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < (obj1.radius || 5) + obj2.radius;
}

function wrap(obj) {
  if (obj.x < 0) obj.x = canvas.width;
  if (obj.x > canvas.width) obj.x = 0;
  if (obj.y < 0) obj.y = canvas.height;
  if (obj.y > canvas.height) obj.y = 0;
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw ship
  ctx.strokeStyle =
    ship.invincible && Math.floor(ship.invincibilityFrames / 10) % 2
      ? "#888"
      : "#FFF";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(
    ship.x + Math.cos(ship.angle) * ship.radius,
    ship.y + Math.sin(ship.angle) * ship.radius
  );
  ctx.lineTo(
    ship.x + Math.cos(ship.angle + Math.PI * 0.8) * ship.radius,
    ship.y + Math.sin(ship.angle + Math.PI * 0.8) * ship.radius
  );
  ctx.lineTo(
    ship.x + Math.cos(ship.angle - Math.PI * 0.8) * ship.radius,
    ship.y + Math.sin(ship.angle - Math.PI * 0.8) * ship.radius
  );
  ctx.closePath();
  ctx.stroke();

  // Draw thrust flame
  if (ship.thrusting) {
    ctx.fillStyle = "#f9a825";
    ctx.beginPath();
    ctx.moveTo(
      ship.x + Math.cos(ship.angle - Math.PI * 0.9) * (ship.radius * 0.8),
      ship.y + Math.sin(ship.angle - Math.PI * 0.9) * (ship.radius * 0.8)
    );
    ctx.lineTo(
      ship.x - Math.cos(ship.angle) * (ship.radius * 1.5),
      ship.y - Math.sin(ship.angle) * (ship.radius * 1.5)
    );
    ctx.lineTo(
      ship.x + Math.cos(ship.angle + Math.PI * 0.9) * (ship.radius * 0.8),
      ship.y + Math.sin(ship.angle + Math.PI * 0.9) * (ship.radius * 0.8)
    );
    ctx.closePath();
    ctx.fill();
  }

  // Draw bullets
  ctx.fillStyle = "#FFF";
  bullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw asteroids
  ctx.strokeStyle = "#FFF";
  ctx.lineWidth = 1.5;
  asteroids.forEach((asteroid) => {
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.angle);
    ctx.beginPath();
    ctx.moveTo(asteroid.vertices[0].x, asteroid.vertices[0].y);
    for (let i = 1; i < asteroid.vertices.length; i++) {
      ctx.lineTo(asteroid.vertices[i].x, asteroid.vertices[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  });
}

function gameLoop() {
  if (gameState === "playing") {
    update();
  }
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
}

export function init() {
  canvas = document.getElementById("asteroids-canvas");
  ctx = canvas.getContext("2d");
  startScreen = document.getElementById("asteroids-start-screen");
  gameOverScreen = document.getElementById("asteroids-game-over-screen");
  startBtn = document.getElementById("asteroids-start-btn");
  restartBtn = document.getElementById("asteroids-restart-btn");
  scoreEl = document.getElementById("asteroids-score");
  livesEl = document.getElementById("asteroids-lives");
  finalScoreEl = document.getElementById("asteroids-final-score");

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  resetGame();
  gameLoop();
}

export function cleanup() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  startBtn.removeEventListener("click", startGame);
  restartBtn.removeEventListener("click", startGame);
  keys = {};
}
