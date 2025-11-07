// js/tools/tower-defense.js

// --- DOM Elements & Canvas ---
let canvas, ctx;
let moneyEl,
  healthEl,
  waveEl,
  startWaveBtn,
  gameOverMsg,
  towerSelectionEl,
  cancelPlacementBtn;

// --- Game Constants ---
const TILE_SIZE = 40;
const PATH_COLOR = "#555";
const GRASS_COLOR = "#3a5943";

// --- Tower Configuration ---
const TOWER_TYPES = {
  gatling: {
    cost: 50,
    range: 100,
    fireRate: 20,
    projectile: { speed: 6, damage: 20, color: "yellow" },
    color: "#00aaff",
  },
  cannon: {
    cost: 100,
    range: 150,
    fireRate: 80,
    projectile: { speed: 4, damage: 120, color: "orange" },
    color: "#ff6347",
  },
};

// --- Enemy Configuration ---
const ENEMY_TYPES = {
  normal: { health: 100, speed: 1.2, color: "#c0392b", money: 5 },
  fast: { health: 70, speed: 2.2, color: "#2980b9", money: 7 },
  tank: { health: 500, speed: 0.8, color: "#8e44ad", money: 15 },
};

// --- Game State ---
let money, health, wave;
let enemies = [];
let towers = [];
let projectiles = [];
let pathTiles = new Set(); // For quick checking of path locations
let gameLoopId = null;
let waveInProgress = false;

// State for placing towers
let selectedTowerType = null;
let towerPreview = { x: 0, y: 0, valid: false };

// Event handlers that need to be removed in cleanup
let placeTowerHandler, previewTowerHandler, cancelPlacementHandler;

// The path enemies will follow (array of {x, y} points in tile coordinates)
const path = [
  { x: -1, y: 5 },
  { x: 2, y: 5 },
  { x: 2, y: 2 },
  { x: 6, y: 2 },
  { x: 6, y: 8 },
  { x: 10, y: 8 },
  { x: 10, y: 3 },
  { x: 16, y: 3 },
];

// --- Classes ---
class Enemy {
  constructor(type, healthMultiplier = 1) {
    this.x = path[0].x * TILE_SIZE + TILE_SIZE / 2;
    this.y = path[0].y * TILE_SIZE + TILE_SIZE / 2;
    this.pathIndex = 1;

    const stats = ENEMY_TYPES[type];
    this.type = type;
    this.maxHealth = stats.health * healthMultiplier;
    this.health = this.maxHealth;
    this.speed = stats.speed;
    this.color = stats.color;
    this.money = stats.money;
  }

  move() {
    if (this.pathIndex >= path.length) {
      // Reached the end
      health--;
      updateUI();
      this.health = 0; // Mark for removal
      return;
    }

    const target = {
      x: path[this.pathIndex].x * TILE_SIZE + TILE_SIZE / 2,
      y: path[this.pathIndex].y * TILE_SIZE + TILE_SIZE / 2,
    };

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.speed) {
      this.x = target.x;
      this.y = target.y;
      this.pathIndex++;
    } else {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }
  }

  draw() {
    // Health bar background
    ctx.fillStyle = "#333";
    ctx.fillRect(this.x - 15, this.y - 20, 30, 5);

    // Health bar foreground
    const healthPercentage = this.health / this.maxHealth;
    ctx.fillStyle =
      healthPercentage > 0.5
        ? "#2ecc71"
        : healthPercentage > 0.2
        ? "#f1c40f"
        : "#e74c3c";
    ctx.fillRect(this.x - 15, this.y - 20, 30 * healthPercentage, 5);

    // Enemy body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Tower {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.fireCooldown = 0;
    Object.assign(this, TOWER_TYPES[type]); // Copy stats from config
  }

  shoot() {
    if (this.fireCooldown > 0) {
      this.fireCooldown--;
      return;
    }

    let target = null;
    let closestDist = this.range; // Use the tower's specific range

    enemies.forEach((enemy) => {
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < closestDist) {
        closestDist = distance;
        target = enemy;
      }
    });

    if (target) {
      projectiles.push(new Projectile(this.x, this.y, target, this.type));
      this.fireCooldown = this.fireRate;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, TILE_SIZE / 2 - 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

class Projectile {
  constructor(x, y, target, towerType) {
    this.x = x;
    this.y = y;
    this.target = target;
    const projectileStats = TOWER_TYPES[towerType].projectile;
    this.speed = projectileStats.speed;
    this.damage = projectileStats.damage;
    this.color = projectileStats.color;
    this.health = 1; // Initialize health to mark it for removal later
  }

  move() {
    // If the target has been destroyed, mark this projectile for removal
    if (this.target.health <= 0) {
      this.health = 0;
      return;
    }
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.speed) {
      this.target.health -= this.damage;
      // If the target is defeated by this projectile, award money
      if (this.target.health <= 0) {
        money += this.target.money;
        updateUI();
      }
      this.health = 0; // Mark for removal
    } else {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Game Loop & Drawing ---

function buildPathSet() {
  pathTiles.clear();
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    if (start.x === end.x) {
      // Vertical
      for (
        let y = Math.min(start.y, end.y);
        y <= Math.max(start.y, end.y);
        y++
      ) {
        pathTiles.add(`${start.x},${y}`);
      }
    } else {
      // Horizontal
      for (
        let x = Math.min(start.x, end.x);
        x <= Math.max(start.x, end.x);
        x++
      ) {
        pathTiles.add(`${x},${start.y}`);
      }
    }
  }
}

function updateUI() {
  moneyEl.textContent = money;
  healthEl.textContent = health;
}

function drawMap() {
  ctx.fillStyle = GRASS_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = PATH_COLOR;
  for (let i = 0; i < path.length - 1; i++) {
    const start = { x: path[i].x * TILE_SIZE, y: path[i].y * TILE_SIZE };
    const end = { x: path[i + 1].x * TILE_SIZE, y: path[i + 1].y * TILE_SIZE };
    if (start.x === end.x) {
      // Vertical path
      ctx.fillRect(
        start.x,
        Math.min(start.y, end.y),
        TILE_SIZE,
        Math.abs(start.y - end.y) + TILE_SIZE
      );
    } else {
      // Horizontal path
      ctx.fillRect(
        Math.min(start.x, end.x),
        start.y,
        Math.abs(start.x - end.x) + TILE_SIZE,
        TILE_SIZE
      );
    }
  }
}

function drawTowerPreview() {
  if (!selectedTowerType) return;

  const towerStats = TOWER_TYPES[selectedTowerType];
  // Draw tower range
  ctx.fillStyle = towerPreview.valid
    ? "rgba(255, 255, 255, 0.2)"
    : "rgba(255, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.arc(towerPreview.x, towerPreview.y, towerStats.range, 0, Math.PI * 2);
  ctx.fill();

  // Draw tower preview
  ctx.fillStyle = towerStats.color;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(
    towerPreview.x - TILE_SIZE / 2,
    towerPreview.y - TILE_SIZE / 2,
    TILE_SIZE,
    TILE_SIZE
  );
  ctx.globalAlpha = 1.0;
}

function gameLoop() {
  // --- UPDATE LOGIC ---
  // First, update the state of all game objects
  towers.forEach((t) => t.shoot());
  projectiles.forEach((p) => p.move());
  enemies.forEach((e) => e.move());

  // Filter out dead enemies and used projectiles
  enemies = enemies.filter((e) => e.health > 0);
  projectiles = projectiles.filter((p) => p.health !== 0);

  // --- DRAW LOGIC ---
  // Now, draw everything in its new state
  drawMap();
  towers.forEach((t) => t.draw());
  projectiles.forEach((p) => p.draw());
  enemies.forEach((e) => e.draw());
  drawTowerPreview();

  if (health <= 0) {
    gameOver("You ran out of health!");
    return;
  }

  if (waveInProgress && enemies.length === 0) {
    waveInProgress = false;
    startWaveBtn.disabled = false;
    startWaveBtn.textContent = "Start Next Wave";
    money += 100 + wave * 10; // Wave completion bonus
    updateUI();
  }

  gameLoopId = requestAnimationFrame(gameLoop);
}

function startWave() {
  wave++;
  waveEl.textContent = wave;
  waveInProgress = true;
  startWaveBtn.disabled = true;

  for (let i = 0; i < wave * 5; i++) {
    const healthMultiplier = 1 + (wave - 1) * 0.2;
    let enemyType = "normal";

    // Introduce new enemy types in later waves
    if (wave > 3 && i % 3 === 0) {
      enemyType = "fast";
    }
    if (wave > 5 && i % 5 === 0) {
      enemyType = "tank";
    }

    setTimeout(() => {
      if (health > 0) {
        // Don't spawn if game is over
        enemies.push(new Enemy(enemyType, healthMultiplier));
      }
    }, i * (600 / (1 + wave * 0.05))); // Spawn enemies faster in later waves
  }
}

function handleTowerSelection(event) {
  const button = event.target.closest("button");
  if (!button) return;
  const type = button.dataset.towerType;
  if (type && TOWER_TYPES[type]) {
    if (money >= TOWER_TYPES[type].cost) {
      selectedTowerType = type;
      cancelPlacementBtn.classList.remove("d-none");
    } else {
      // Maybe flash the money red or show a message
    }
  }
}

function previewTower(event) {
  if (!selectedTowerType) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
  const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);

  towerPreview.x = x * TILE_SIZE + TILE_SIZE / 2;
  towerPreview.y = y * TILE_SIZE + TILE_SIZE / 2;

  // Check if placement is valid
  const onPath = pathTiles.has(`${x},${y}`);
  const onTower = towers.some(
    (t) => t.x === towerPreview.x && t.y === towerPreview.y
  );
  towerPreview.valid = !onPath && !onTower;
}

function placeTower() {
  if (!selectedTowerType || !towerPreview.valid) return;

  const cost = TOWER_TYPES[selectedTowerType].cost;
  if (money < cost) return;

  towers.push(new Tower(towerPreview.x, towerPreview.y, selectedTowerType));
  money -= cost;
  updateUI();

  // Exit placement mode
  cancelPlacement();
}

function cancelPlacement() {
  selectedTowerType = null;
  cancelPlacementBtn.classList.add("d-none");
}

function gameOver(message) {
  cancelAnimationFrame(gameLoopId);
  gameLoopId = null;
  gameOverMsg.textContent = message;
  gameOverMsg.classList.remove("d-none");
  startWaveBtn.textContent = "Restart Game";
  startWaveBtn.disabled = false;
  startWaveBtn.onclick = initGame; // Change button to restart
}

function initGame() {
  // Build path set for quick lookups
  buildPathSet();

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Reset state
  money = 100;
  health = 20;
  wave = 0;
  enemies = [];
  towers = [];
  projectiles = [];
  waveInProgress = false;
  cancelPlacement();

  // Reset UI
  updateUI();
  gameOverMsg.classList.add("d-none");
  startWaveBtn.textContent = "Start Game";
  startWaveBtn.disabled = false;
  startWaveBtn.onclick = startWave;

  if (!gameLoopId) {
    gameLoop();
  }
}

// --- Router Hooks ---
export function init() {
  canvas = document.getElementById("tower-defense-canvas");
  ctx = canvas.getContext("2d");
  moneyEl = document.getElementById("td-money");
  healthEl = document.getElementById("td-health");
  waveEl = document.getElementById("td-wave");
  startWaveBtn = document.getElementById("start-wave-btn");
  gameOverMsg = document.getElementById("game-over-message");
  towerSelectionEl = document.getElementById("tower-selection");
  cancelPlacementBtn = document.getElementById("cancel-placement-btn");

  // Store handlers to remove them later
  placeTowerHandler = () => placeTower();
  previewTowerHandler = (e) => previewTower(e);
  cancelPlacementHandler = () => cancelPlacement();

  canvas.addEventListener("click", placeTowerHandler);
  canvas.addEventListener("mousemove", previewTowerHandler);
  towerSelectionEl.addEventListener("click", handleTowerSelection);
  cancelPlacementBtn.addEventListener("click", cancelPlacementHandler);

  initGame();
}

export function cleanup() {
  cancelAnimationFrame(gameLoopId);
  gameLoopId = null;
  canvas?.removeEventListener("click", placeTowerHandler);
  canvas?.removeEventListener("mousemove", previewTowerHandler);
  towerSelectionEl?.removeEventListener("click", handleTowerSelection);
  cancelPlacementBtn?.removeEventListener("click", cancelPlacementHandler);
}
