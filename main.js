import { initGameState } from './gameState.js';
import { renderMap, toggleFog } from './mapRenderer.js';

let gameState = initGameState();

// --- Turn tracking ---
let currentTurn = 'player'; // 'player' or 'enemy'
let selectedShip = null;

// --- Show game container and render initial map ---
document.getElementById("new-game").addEventListener("click", () => {
    document.getElementById("splash-screen").style.display = "none";
    document.getElementById("game-container").style.display = "flex";
    renderMap(gameState);
});

// --- Fog toggle ---
document.getElementById("toggle-fog").addEventListener("click", () => {
    toggleFog();
    renderMap(gameState, selectedShip);
});

// --- End turn ---
document.getElementById("end-turn").addEventListener("click", () => {
    if (currentTurn !== 'player') return;
    currentTurn = 'enemy';
    alert("Enemy turn placeholder");
    // Reset moves for player's ships
    for (let row of gameState.map) {
        for (let tile of row) {
            if (tile.objectData?.type === 'frigate' && tile.objectData.owner === 'player') {
                tile.objectData.hasMoved = false;
            }
        }
    }
    currentTurn = 'player';
    selectedShip = null;
    renderMap(gameState);
});

canvas.addEventListener("click", e => {
  if (currentTurn !== 'player') return;

  const { x: tileX, y: tileY } = tileFromMouse(e);
  const clickedTile = getObjectAtTile(tileX, tileY);

  if (selectedShip && !clickedTile) {
    // calculate distance
    const dx = Math.abs(tileX - selectedShip.x);
    const dy = Math.abs(tileY - selectedShip.y);

    if (dx <= selectedShip.stats.moveRange && dy <= selectedShip.stats.moveRange && !isOccupied(tileX, tileY)) {
      // Move ship
      const oldTile = gameState.map[selectedShip.y][selectedShip.x];
      oldTile.object = null;
      oldTile.objectData = null;

      const newTile = gameState.map[tileY][tileX];
      newTile.object = 'frigate';
      newTile.objectData = selectedShip;
      newTile.explored = true; // make ship visible immediately

      selectedShip.x = tileX;
      selectedShip.y = tileY;
      selectedShip.hasMoved = true; // mark ship as having moved this turn

      selectedShip = null;

      renderMap(gameState); // redraw map immediately
    }
  } else if (clickedTile && clickedTile.objectData?.owner === 'player' && clickedTile.objectData.type === 'frigate') {
    selectedShip = clickedTile.objectData;
  } else {
    selectedShip = null;
  }
});

    renderMap(gameState, selectedShip);
});

