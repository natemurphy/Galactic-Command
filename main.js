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

// --- Canvas click for movement/selection ---
const canvas = document.getElementById("game-canvas");
canvas.addEventListener("click", (e) => {
    if (currentTurn !== 'player') return;

    const rect = canvas.getBoundingClientRect();
    const TILE_SIZE = Math.floor(canvas.clientHeight / gameState.height);
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    const clickedTile = gameState.map[tileY]?.[tileX];
    if (!clickedTile) return;

    // Select a player's frigate
    if (clickedTile.objectData?.type === 'frigate' && clickedTile.objectData.owner === 'player') {
        if (!clickedTile.objectData.hasMoved) selectedShip = clickedTile.objectData;
    }
    // Move the selected ship
    else if (selectedShip) {
        const dx = Math.abs(tileX - selectedShip.x);
        const dy = Math.abs(tileY - selectedShip.y);
        const targetTile = gameState.map[tileY][tileX];

        // Valid move: within range and tile not occupied
        if ((dx + dy === 1) && !targetTile.objectData) {
            // Clear old position
            const oldTile = gameState.map[selectedShip.y][selectedShip.x];
            oldTile.object = 'empty';
            oldTile.objectData = null;

            // Update new position
            targetTile.object = 'frigate';
            targetTile.objectData = selectedShip;
            selectedShip.x = tileX;
            selectedShip.y = tileY;
            selectedShip.hasMoved = true;

            selectedShip = null;
        }
    }

    renderMap(gameState, selectedShip);
});
