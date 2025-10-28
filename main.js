// ==============================
// BASIC SETUP
// ==============================
const splash = document.getElementById("splash-screen");
const settings = document.getElementById("settings-screen");
const game = document.getElementById("game-screen");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const newGameBtn = document.getElementById("new-game");
const toggleFogBtn = document.getElementById("toggle-fog");
const endTurnBtn = document.getElementById("end-turn");

let tileSize = 40;
let mapWidth, mapHeight;
let map = [];
let selectedShip = null;

let fogEnabled = false;
let hasMovedThisTurn = false;
let visibleRadius = 3;

let currentTurn = "Player";

// Player resources
let metal = 100;
let energy = 50;
let population = 10;

// ==============================
// EVENT LISTENERS
// ==============================
newGameBtn.addEventListener("click", () => {
  splash.classList.add("hidden");
  game.classList.remove("hidden");
  initGame();
});

toggleFogBtn.addEventListener("click", () => {
  fogEnabled = !fogEnabled;
  draw();
});

endTurnBtn.addEventListener("click", endTurn);

canvas.addEventListener("click", handleCanvasClick);

// ==============================
// MAP & GAME INITIALIZATION
// ==============================
function initGame() {
  resizeCanvas();
  generateMap();
  placeObjects();
  draw();
}

function resizeCanvas() {
  canvas.width = window.innerWidth - 440;
  canvas.height = window.innerHeight;
  mapWidth = Math.floor(canvas.width / tileSize);
  mapHeight = Math.floor(canvas.height / tileSize);
}

function generateMap() {
  map = [];
  for (let y = 0; y < mapHeight; y++) {
    const row = [];
    for (let x = 0; x < mapWidth; x++) {
      row.push({ type: "empty" });
    }
    map.push(row);
  }
}

function placeObjects() {
  map[2][2].type = "planet";
  map[2][3].type = "station";
  map[3][3].type = "frigate";
}

// ==============================
// DRAWING FUNCTIONS
// ==============================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const tile = map[y][x];
      drawTile(x, y, tile.type);
    }
  }

  // Fog of War Layer
  if (fogEnabled) {
    drawFog();
  }
}

function drawTile(x, y, type) {
  const emojis = {
    empty: "·",
    planet: "🌍",
    station: "🏭",
    frigate: "🚀"
  };

  ctx.font = `${tileSize - 10}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "red";

  ctx.fillText(emojis[type] || "·", x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
}

function drawFog() {
  const shipPos = findShipPosition();
  if (!shipPos) return;

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const dx = x - shipPos.x;
      const dy = y - shipPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > visibleRadius) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

// ==============================
// GAME LOGIC
// ==============================
function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize);
  const y = Math.floor((e.clientY - rect.top) / tileSize);

  const clickedTile = map[y]?.[x];
  if (!clickedTile) return;

  if (clickedTile.type === "frigate") {
    selectedShip = { x, y };
  } else if (selectedShip && clickedTile.type === "empty") {
    tryMoveShip(selectedShip.x, selectedShip.y, x, y);
  }
  draw();
}

function tryMoveShip(fromX, fromY, toX, toY) {
  if (hasMovedThisTurn) return;

  const dx = Math.abs(toX - fromX);
  const dy = Math.abs(toY - fromY);
  if (dx <= 1 && dy <= 1 && map[toY][toX].type === "empty") {
    map[toY][toX].type = "frigate";
    map[fromY][fromX].type = "empty";
    hasMovedThisTurn = true;
  }
}

function findShipPosition() {
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      if (map[y][x].type === "frigate") return { x, y };
    }
  }
  return null;
}

function endTurn() {
  hasMovedThisTurn = false;
  generateResources();
  draw();
}

function generateResources() {
  metal += 5;
  energy += 2;
  population += 1;
  document.getElementById("metal").textContent = metal;
  document.getElementById("energy").textContent = energy;
  document.getElementById("population").textContent = population;
}
