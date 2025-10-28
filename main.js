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

canvas.addEventListener("click", e => {
  if (currentTurn !== 'player') return;

  const { x, y } = tileFromMouse(e);
  const clickedTile = gameState.map[y][x];

  // If a ship is selected and click is a valid move
  if (selectedShip && (!clickedTile.object || clickedTile.object === "empty")) {
    const dx = Math.abs(x - selectedShip.x);
    const dy = Math.abs(y - selectedShip.y);

    if (dx <= selectedShip.stats.moveRange && dy <= selectedShip.stats.moveRange) {
      // Remove ship from old tile
      const oldTile = gameState.map[selectedShip.y][selectedShip.x];
      oldTile.object = "empty";
      oldTile.objectData = null;

      // Move ship to new tile
      clickedTile.object = "frigate";
      clickedTile.objectData = selectedShip;
      clickedTile.explored = true;

      // Update ship data
      selectedShip.x = x;
      selectedShip.y = y;
      selectedShip.hasMoved = true;

      // Deselect after moving
      selectedShip = null;

      // Re-render
      renderMap(gameState);
    }
  } 
  // Select ship if clicking on it
  else if (clickedTile.objectData && clickedTile.objectData.type === "frigate" && clickedTile.objectData.owner === "player") {
    selectedShip = clickedTile.objectData;
  } 
  else {
    selectedShip = null;
  }

  renderMap(gameState, selectedShip);
});


