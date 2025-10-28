import { initGameState } from './gameState.js';
import { generateMap, renderMap, toggleFog } from './mapRenderer.js';

let gameState = initGameState();
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
