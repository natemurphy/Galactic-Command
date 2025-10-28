import { initGameState } from "./gameState.js";
import { generateMap, renderMap, toggleFog } from "./mapRenderer.js";

// ======= Game State ======= //
let gameState = initGameState();

// ======= DOM Elements ======= //
const canvas = document.getElementById("game-canvas");
const fogBtn = document.getElementById("toggle-fog");

// ======= Initial Setup ======= //
generateMap(gameState);
renderMap(gameState);

// ======= Button Events ======= //
fogBtn.addEventListener("click", () => {
    toggleFog(gameState);
    renderMap(gameState);
});
