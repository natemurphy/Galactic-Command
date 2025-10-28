const splash = document.getElementById("splash-screen");
const settings = document.getElementById("settings-screen");
const game = document.getElementById("game-screen");

document.getElementById("new-game").onclick = () => {
  splash.classList.remove("active");
  game.classList.add("active");
  initGame();
};

document.getElementById("settings-btn").onclick = () => {
  splash.classList.remove("active");
  settings.classList.add("active");
};

document.getElementById("settings-back").onclick = () => {
  settings.classList.remove("active");
  splash.classList.add("active");
};

// Game core
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let tileSize = 40;
let rows, cols;
let map = [];
let playerShips = [];
let selectedShip = null;
let playerTurn = true;
let fogEnabled = false;

function initGame() {
  resizeCanvas();
  generateMap();
  drawMap();
}

function resizeCanvas() {
  canvas.width = window.innerWidth - 440; // left+right panels
  canvas.height = window.innerHeight - 80; // adds top/bottom spacing
  cols = Math.floor(canvas.width / tileSize);
  rows = Math.floor(canvas.height / tileSize);
}

function generateMap() {
  map = [];
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      row.push({ type: "empty", visible: true, occupied: false });
    }
    map.push(row);
  }

  placeObject(2, 2, "planet");
  placeObject(3, 2, "station");
  const ship = { x: 4, y: 2, type: "frigate", moveRange: 1, hasMoved: false };
  playerShips.push(ship);
  placeObject(ship.x, ship.y, "frigate");
}

function placeObject(x, y, type) {
  map[y][x].type = type;
  map[y][x].occupied = true;
}

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tile = map[y][x];
      const emoji = getEmojiForTile(tile);
      ctx.fillStyle = "white";
      ctx.font = `${tileSize - 8}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
    }
  }

  if (selectedShip) {
    highlightValidMoves(selectedShip);
  }
}

function getEmojiForTile(tile) {
  if (fogEnabled && !tile.visible) return "⬜";
  switch (tile.type) {
    case "planet": return "🌍";
    case "station": return "🛰️";
    case "frigate":
      const ship = playerShips.find(s => s.x === map.indexOf(tile));
      return "🚀";
    default: return "⬛";
  }
}

canvas.addEventListener("click", (e) => {
  if (!playerTurn) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize);
  const y = Math.floor((e.clientY - rect.top) / tileSize);

  const tile = map[y][x];

  const clickedShip = playerShips.find(s => s.x === x && s.y === y);

  if (clickedShip && !clickedShip.hasMoved) {
    selectedShip = clickedShip;
    drawMap();
  } else if (selectedShip) {
    moveShip(selectedShip, x, y);
  }
});

function moveShip(ship, x, y) {
  if (ship.hasMoved) return;

  const dx = Math.abs(x - ship.x);
  const dy = Math.abs(y - ship.y);
  if (dx <= ship.moveRange && dy <= ship.moveRange && !map[y][x].occupied) {
    map[ship.y][ship.x] = { type: "empty", visible: true, occupied: false };
    ship.x = x;
    ship.y = y;
    ship.hasMoved = true;
    map[y][x] = { type: ship.type, visible: true, occupied: true };
    selectedShip = null;
    drawMap();
  }
}

function highlightValidMoves(ship) {
  const { x, y, moveRange } = ship;
  for (let dy = -moveRange; dy <= moveRange; dy++) {
    for (let dx = -moveRange; dx <= moveRange; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < cols &&
        ny < rows &&
        !map[ny][nx].occupied
      ) {
        ctx.fillStyle = "rgba(0,255,255,0.2)";
        ctx.fillRect(nx * tileSize, ny * tileSize, tileSize, tileSize);
      }
    }
  }
}

document.getElementById("toggle-fog").onclick = () => {
  fogEnabled = !fogEnabled;
  drawMap();
};

document.getElementById("end-turn").onclick = () => {
  endPlayerTurn();
};

function endPlayerTurn() {
  playerTurn = false;
  document.getElementById("turn-indicator").innerText = "Turn: Enemy";
  setTimeout(() => {
    playerShips.forEach(s => s.hasMoved = false);
    playerTurn = true;
    document.getElementById("turn-indicator").innerText = "Turn: Player";
    drawMap();
  }, 1000);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  drawMap();
});
