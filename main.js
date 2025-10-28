import { initGameState } from './gameState.js';
import { generateMap, renderMap, toggleFog } from './mapRenderer.js';

const splashScreen = document.getElementById("splash-screen");
const settingsScreen = document.getElementById("settings-screen");
const gameContainer = document.getElementById("game-container");

const newGameBtn = document.getElementById("new-game");
const loadGameBtn = document.getElementById("load-game");
const settingsBtn = document.getElementById("settings-btn");
const settingsBackBtn = document.getElementById("settings-back");
const toggleFogBtn = document.getElementById("toggle-fog");

let gameState;

// ===== Button Events =====
newGameBtn.addEventListener("click", () => {
    splashScreen.style.display = "none";
    gameContainer.style.display = "grid";

    gameState = initGameState();
    generateMap(gameState);
    renderMap(gameState);
});

settingsBtn.addEventListener("click", () => {
    splashScreen.style.display = "none";
    settingsScreen.style.display = "flex";
});

settingsBackBtn.addEventListener("click", () => {
    settingsScreen.style.display = "none";
    splashScreen.style.display = "flex";
});

toggleFogBtn.addEventListener("click", () => {
    toggleFog();
    renderMap(gameState);
});
