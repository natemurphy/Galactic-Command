import { initGameState } from './gameState.js';
import { generateMap, renderMap, toggleFog } from './mapRenderer.js';

let gameState = initGameState();
let currentTurn = 'player'; // tracks whose turn it is

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

// --- Map click handler ---
canvas.addEventListener("click", e => {
  if (!gameState || currentTurn !== "player") return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const TILE_SIZE = Math.floor(canvas.clientHeight / gameState.height);
  const x = Math.floor(mx / TILE_SIZE);
  const y = Math.floor(my / TILE_SIZE);

  const clickedTile = gameState.map[y][x];
  const clickedObj = clickedTile.objectData;

  if (selectedShip) {
    // Try to move
    const dx = Math.abs(x - selectedShip.x);
    const dy = Math.abs(y - selectedShip.y);

    if ((dx + dy <= selectedShip.stats.moveRange) && !clickedTile.object) {
      // Remove ship from old tile
      const oldTile = gameState.map[selectedShip.y][selectedShip.x];
      oldTile.object = null;
      oldTile.objectData = null;

      // Update ship coordinates
      selectedShip.x = x;
      selectedShip.y = y;
      selectedShip.hasMoved = true;

      // Place ship in new tile
      clickedTile.object = "frigate";
      clickedTile.objectData = selectedShip;
      clickedTile.explored = true;

      selectedShip = null; // deselect after move
    } else {
      // clicked invalid tile, deselect
      selectedShip = null;
    }
  } else if (clickedObj && clickedObj.type === "frigate" && clickedObj.owner === "player") {
    // Select ship
    selectedShip = clickedObj;
  }

  renderMap(gameState, selectedShip);
});



