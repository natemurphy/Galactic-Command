import { initGameState } from "./gameState.js";
import { generateMap, renderMap, toggleFog } from "./mapRenderer.js";

document.addEventListener("DOMContentLoaded", () => {
    let gameState;

    const splashScreen = document.getElementById("splash-screen");
    const gameContainer = document.getElementById("game-container");
    const settingsScreen = document.getElementById("settings-screen");
    const fileInput = document.getElementById("file-input");

    const settingsBtn = document.getElementById("settings-btn");
    const settingsBack = document.getElementById("settings-back");
    const musicToggle = document.getElementById("music-toggle");
    const musicVolume = document.getElementById("music-volume");

    const toggleFogBtn = document.getElementById("toggle-fog");

    const bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.volume = 0.5;

    // Start new game
    document.getElementById("new-game").addEventListener("click", () => {
        gameState = initGameState();
        generateMap(gameState);
        startGame();
        if (musicToggle.checked) bgMusic.play().catch(() => {});
    });

    // Load game
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

    // Settings navigation
    settingsBtn.addEventListener("click", () => {
        splashScreen.style.display = "none";
        settingsScreen.style.display = "flex";
    });

    settingsBack.addEventListener("click", () => {
        settingsScreen.style.display = "none";
        splashScreen.style.display = "flex";
    });

    // Music control
    musicToggle.addEventListener("change", () => {
        if (musicToggle.checked) bgMusic.play().catch(() => {});
        else bgMusic.pause();
    });

    musicVolume.addEventListener("input", () => {
        bgMusic.volume = musicVolume.value / 100;
    });

    // Fog toggle
    toggleFogBtn.addEventListener("click", () => {
        toggleFog(gameState);
        renderMap(gameState);
    });

    function startGame() {
        splashScreen.style.display = "none";
        settingsScreen.style.display = "none";
        gameContainer.style.display = "grid";
        renderMap(gameState);
    }
});
