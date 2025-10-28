import { initGameState } from './gameState.js';
import { renderMap, toggleFog } from './mapRenderer.js';

let gameState = initGameState();
let selectedShip = null;
let currentTurn = 'player'; // tracks whose turn it is

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
    renderMap(gameState, selectedShip);
});

// --- End turn ---
document.getElementById("end-turn").addEventListener("click", () => {
    if (currentTurn !== 'player') return;
    // Reset player ships
    for (let y = 0; y < gameState.height; y++) {
        for (let x = 0; x < gameState.width; x++) {
            const tile = gameState.map[y][x];
            if (tile.objectData && tile.objectData.owner === 'player' && tile.objectData.type === 'frigate') {
                tile.objectData.hasMoved = false;
            }
        }
    }
    currentTurn = 'player'; // AI placeholder immediately returns turn
    selectedShip = null;
    renderMap(gameState);
});

// --- Canvas click for selecting/moving ships ---
const canvas = document.getElementById("game-canvas");
canvas.addEventListener("click", (e) => {
    if (currentTurn !== 'player') return;

    const rect = canvas.getBoundingClientRect();
    const TILE_SIZE = Math.floor(canvas.clientHeight / gameState.height);
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

    const tile = gameState.map[y]?.[x];
    if (!tile) return;

    // If a ship is selected and clicked tile is empty & valid
    if (selectedShip && !tile.object) {
        const dx = Math.abs(x - selectedShip.x);
        const dy = Math.abs(y - selectedShip.y);
        if (dx + dy <= selectedShip.stats.moveRange && !selectedShip.hasMoved) {
            // Clear old tile
            gameState.map[selectedShip.y][selectedShip.x].object = null;
            gameState.map[selectedShip.y][selectedShip.x].objectData = null;

            // Move to new tile
            tile.object = 'frigate';
            tile.objectData = selectedShip;
            tile.explored = true;

            selectedShip.x = x;
            selectedShip.y = y;
            selectedShip.hasMoved = true;

            selectedShip = null; // deselect after moving
        }
    } else if (tile.objectData && tile.objectData.owner === 'player' && tile.objectData.type === 'frigate') {
        // Select a ship
        selectedShip = tile.objectData.hasMoved ? null : tile.objectData;
    } else {
        selectedShip = null;
    }

    renderMap(gameState, selectedShip);
});

// Initial render
renderMap(gameState);
