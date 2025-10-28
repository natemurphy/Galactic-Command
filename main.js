import { initGameState } from "./gameState.js";
import { generateMap, renderMap, toggleFog } from "./mapRenderer.js";

let gameState = initGameState();

// ===== Splash screen buttons =====
document.getElementById("new-game").addEventListener("click", () => {
    document.getElementById("splash-screen").style.display = "none";
    document.getElementById("game-container").style.display = "grid";
    startGame();
});

document.getElementById("settings-btn").addEventListener("click", () => {
    document.getElementById("splash-screen").style.display = "none";
    document.getElementById("settings-screen").style.display = "flex";
});

document.getElementById("settings-back").addEventListener("click", () => {
    document.getElementById("settings-screen").style.display = "none";
    document.getElementById("splash-screen").style.display = "flex";
});

// ===== Game logic =====
function startGame() {
    generateMap(gameState);
    renderMap(gameState);
}

// Toggle fog
document.getElementById("toggle-fog").addEventListener("click", () => {
    toggleFog(gameState);
    renderMap(gameState);
});

// ===== Canvas click for selecting/moving frigate =====
const canvas = document.getElementById("game-canvas");

canvas.addEventListener("click", e => {
    if (gameState.currentTurn !== 'player') return;

    const rect = canvas.getBoundingClientRect();
    const TILE_SIZE = canvas.height / gameState.height;
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

    // Check if playerShip is clicked
    if (gameState.map[y][x].object === "playerShip") {
        gameState.selectedObject = { x, y, type: "playerShip", moved: false };
    } else if (gameState.selectedObject) {
        // Move ship if valid
        const dx = Math.abs(x - gameState.selectedObject.x);
        const dy = Math.abs(y - gameState.selectedObject.y);
        if (dx <= 1 && dy <= 1 && gameState.map[y][x].object === "empty") {
            // Move ship
            gameState.map[gameState.selectedObject.y][gameState.selectedObject.x].object = "empty";
            gameState.map[y][x].object = "playerShip";
            gameState.selectedObject.x = x;
            gameState.selectedObject.y = y;
            gameState.selectedObject.moved = true;
        }
        gameState.selectedObject = null;
    }

    renderMap(gameState);
});

// ===== End Turn =====
document.getElementById("end-turn").addEventListener("click", () => {
    if (gameState.currentTurn !== 'player') return;

    // Reset player ship move
    gameState.currentTurn = 'enemy';
    document.getElementById("turn-indicator").textContent = "Turn: Enemy";

    setTimeout(() => {
        // AI placeholder does nothing
        gameState.currentTurn = 'player';
        document.getElementById("turn-indicator").textContent = "Turn: Player";
    }, 500);

    renderMap(gameState);
});

// ===== Handle window resize =====
function resizeCanvas() {
    renderMap(gameState);
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);
