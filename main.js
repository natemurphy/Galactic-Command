import { initGameState } from "./gameState.js";
import { generateMap, renderMap, toggleFog } from "./mapRenderer.js";

let gameState = initGameState();
generateMap(gameState);

const canvas = document.getElementById("game-canvas");

function resizeCanvas() {
    const mapArea = document.getElementById("map-area");

    const TILE_SIZE = Math.floor(mapArea.clientHeight / gameState.height);
    canvas.width = TILE_SIZE * gameState.width;
    canvas.height = TILE_SIZE * gameState.height;

    renderMap(gameState);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", () => {
    resizeCanvas();

    // Splash buttons
    document.getElementById("new-game").addEventListener("click", () => {
        document.getElementById("splash-screen").style.display = "none";
        document.getElementById("game-container").style.display = "flex";
        renderMap(gameState);
    });

    document.getElementById("toggle-fog").addEventListener("click", () => {
        toggleFog(gameState);
        renderMap(gameState);
    });
});
