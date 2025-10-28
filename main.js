import { initGameState } from './gameState.js';
import { generateMap, renderMap, toggleFog } from './mapRenderer.js';

let gameState = initGameState();

let selectedShip = null;

generateMap(gameState);

// --- Splash screen buttons ---
document.getElementById("new-game").addEventListener("click", () => {
  document.getElementById("splash-screen").style.display = "none";
  document.getElementById("game-container").style.display = "flex";
  renderMap(gameState);
});

document.getElementById("settings-btn").addEventListener("click", () => {
  document.getElementById("splash-screen").style.display = "none";
  document.getElementById("settings-screen").style.display = "flex";
});

document.getElementById("settings-back").addEventListener("click", () => {
  document.getElementById("settings-screen").style.display = "none";
  document.getElementById("splash-screen").style.display = "flex";
});

// --- Fog toggle ---
document.getElementById("toggle-fog").addEventListener("click", () => {
  toggleFog();
  renderMap(gameState);
});

// --- End turn ---
document.getElementById("end-turn").addEventListener("click", () => {
  alert("Enemy turn placeholder (does nothing yet)");
});

// --- Ship selection and movement ---
const canvas = document.getElementById("game-canvas");

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / (canvas.width / gameState.width));
  const y = Math.floor((e.clientY - rect.top) / (canvas.height / gameState.height));

  const tile = gameState.map[y]?.[x];
  if (!tile) return;

  if (tile.objectData?.owner === "player" && tile.objectData.type === "frigate") {
    // Select this ship
    selectedShip = { x, y, data: tile.objectData };
  } else if (selectedShip) {
    // Try moving ship if within 1 tile
    const dx = Math.abs(x - selectedShip.x);
    const dy = Math.abs(y - selectedShip.y);
    if (dx + dy <= selectedShip.data.stats.moveRange && tile.object === "empty") {
      // Move ship
      gameState.map[selectedShip.y][selectedShip.x].object = "empty";
      gameState.map[selectedShip.y][selectedShip.x].objectData = null;

      tile.object = selectedShip.data.type;
      tile.objectData = selectedShip.data;
      tile.objectData.x = x;
      tile.objectData.y = y;

      selectedShip = null;
    }
  }

  renderMap(gameState, selectedShip);
});

