import { initGameState } from "./gameState.js";
import { generateMap, renderMap, toggleFog } from "./mapRenderer.js";

// ======= DOM Elements ======= //
const canvas = document.getElementById("game-canvas");
const fogBtn = document.getElementById("toggle-fog");
const endTurnBtn = document.getElementById("end-turn");
const turnIndicator = document.getElementById("turn-indicator");

// ======= Game State ======= //
let gameState = initGameState();
let selectedObject = null;
let currentTurn = "player"; // player or enemy

// ======= Canvas Tile Size ======= //
const TILE_SIZE = Math.floor(window.innerHeight / gameState.height);

// ======= Generate Initial Map ======= //
generateMap(gameState);
renderMap(gameState);

// ======= Helpers ======= //
function getObjectAtTile(x, y) {
  return gameState.map[y][x].objectData || null;
}

function isOccupied(x, y) {
  return !!getObjectAtTile(x, y);
}

function tileFromMouse(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  return { x: Math.floor(mx / TILE_SIZE), y: Math.floor(my / TILE_SIZE) };
}

function findEmptyAdjacentTile(x, y) {
  const offsets = [
    { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy: 0 },                 { dx: 1, dy: 0 },
    { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 },
  ];
  for (let o of offsets) {
    const tx = x + o.dx;
    const ty = y + o.dy;
    if (tx >= 0 && tx < gameState.width && ty >= 0 && ty < gameState.height) {
      if (!isOccupied(tx, ty)) return { x: tx, y: ty };
    }
  }
  return null;
}

// ======= Place Starter Objects ======= //
// Player Base
gameState.map[0][0].objectData = { type: "playerBase", owner: "player" };

// Space Station next to base
const stationTile = findEmptyAdjacentTile(0, 0);
if (stationTile) {
  gameState.map[stationTile.y][stationTile.x].objectData = {
    type: "station",
    owner: "player",
    hp: 500,
  };
}

// Starter Frigate
const frigateTile = findEmptyAdjacentTile(stationTile.x, stationTile.y);
if (frigateTile) {
  gameState.map[frigateTile.y][frigateTile.x].objectData = {
    type: "frigate",
    owner: "player",
    hasMoved: false,
    stats: { moveRange: 1, miningSpeed: 5, hp: 100, damage: 10 },
  };
}

// ======= Input Handling ======= //
canvas.addEventListener("click", (e) => {
  if (currentTurn !== "player") return;

  const { x, y } = tileFromMouse(e);
  const clicked = getObjectAtTile(x, y);

  if (selectedObject && !clicked) {
    // Try to move
    const dx = Math.abs(x - selectedObject.x);
    const dy = Math.abs(y - selectedObject.y);
    if (
      dx <= selectedObject.stats.moveRange &&
      dy <= selectedObject.stats.moveRange &&
      !isOccupied(x, y)
    ) {
      // Move object
      gameState.map[selectedObject.y][selectedObject.x].objectData = null;
      selectedObject.x = x;
      selectedObject.y = y;
      gameState.map[y][x].objectData = selectedObject;
      selectedObject.hasMoved = true;
      selectedObject = null;
    }
  } else if (clicked && clicked.owner === "player" && clicked.type === "frigate") {
    selectedObject = clicked;
  } else {
    selectedObject = null;
  }

  renderMap(gameState);
});

// ======= Turn System ======= //
endTurnBtn.addEventListener("click", () => {
  if (currentTurn !== "player") return;
  endPlayerTurn();
});

function endPlayerTurn() {
  currentTurn = "enemy";
  turnIndicator.textContent = "Turn: Enemy";

  // Placeholder AI - does nothing for now
  setTimeout(() => {
    // Reset player ships
    for (let y = 0; y < gameState.height; y++) {
      for (let x = 0; x < gameState.width; x++) {
        const obj = getObjectAtTile(x, y);
        if (obj && obj.owner === "player" && obj.type === "frigate") {
          obj.hasMoved = false;
        }
      }
    }

    currentTurn = "player";
    turnIndicator.textContent = "Turn: Player";
    renderMap(gameState);
  }, 1000);
}

// ======= Fog Button ======= //
fogBtn.addEventListener("click", () => {
  toggleFog(gameState);
  renderMap(gameState);
});
