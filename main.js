import { initGameState } from "./gameState.js";
import { generateMap, renderMap, toggleFog } from "./mapRenderer.js";

document.addEventListener("DOMContentLoaded", () => {
    let gameState;

    const splashScreen = document.getElementById("splash-screen");
    const gameContainer = document.getElementById("game-container");
    const settingsScreen = document.getElementById("settings-screen");
    const fileInput = document.getElementById("file-input");

    // Settings elements
    const settingsBtn = document.getElementById("settings-btn");
    const settingsBack = document.getElementById("settings-back");
    const musicToggle = document.getElementById("music-toggle");
    const musicVolume = document.getElementById("music-volume");

    // Toolbar
    const toggleFogBtn = document.getElementById("toggle-fog");

    // Background music (skip audio for now)
    let bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.volume = 0.5;

    // New Game
    document.getElementById("new-game").addEventListener("click", () => {
        gameState = initGameState();
        generateMap(gameState);
        startGame();

        // Play music only after user interaction
        if (musicToggle.checked) bgMusic.play().catch(() => {});
    });

    // Continue Game
    document.getElementById("load-game").addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const json = event.target.result;
            gameState = JSON.parse(json);
            startGame();
            if (musicToggle.checked) bgMusic.play().catch(() => {});
        };
        reader.readAsText(file);
    });

    // Settings button
    settingsBtn.addEventListener("click", () => {
        splashScreen.style.display = "none";
        settingsScreen.style.display = "flex";
    });

    // Back button from settings
    settingsBack.addEventListener("click", () => {
        settingsScreen.style.display = "none";
        splashScreen.style.display = "flex";
    });

    // Music controls
    musicToggle.addEventListener("change", () => {
        if (musicToggle.checked) bgMusic.play().catch(() => {});
        else bgMusic.pause();
    });

    musicVolume.addEventListener("input", () => {
        bgMusic.volume = musicVolume.value / 100;
    });

    // Toolbar buttons
    toggleFogBtn.addEventListener("click", () => {
        toggleFog(gameState);
        renderMap(gameState);
    });

    function startGame() {
        splashScreen.style.display = "none";
        settingsScreen.style.display = "none";
        gameContainer.style.display = "flex";
        renderMap(gameState);
    }
});
