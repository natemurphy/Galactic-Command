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

    // Background music (skip error for now)
    let bgMusic = new Audio(); // no source for now
    bgMusic.loop = true;
    bgMusic.volume = 0.5;

    // New Game
    document.getElementById("new-game").addEventListener("click", () => {
        gameState = initGameState();
        generateMap(gameState);
        startGame();

        // Only play music after user clicked button
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

            // Only play music after user clicked button
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

    // Start the game
    function startGame() {
        splashScreen.style.display = "none";
        settingsScreen.style.display = "none";
        gameContainer.style.display = "flex";
        renderMap(gameState); // draws procedural map
    }
});
