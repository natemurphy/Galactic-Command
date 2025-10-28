// ======= Basic Setup ======= //
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const tileSize = 40;
let cols, rows;

// ======= Game State ======= //
let map = [];
let objects = [];
let selectedObject = null;
let currentTurn = 'player';
let fogEnabled = true;

// ======= DOM Elements ======= //
const splashScreen = document.getElementById("splash-screen");
const settingsScreen = document.getElementById("settings-screen");
const gameContainer = document.getElementById("game-container");
const fileInput = document.getElementById("file-input");

// ======= Splash Screen Buttons ======= //
document.getElementById("new-game").addEventListener("click", () => {
    splashScreen.style.display = "none";
    settingsScreen.style.display = "none";
    gameContainer.style.display = "grid";
    initGame();
});

document.getElementById("settings-btn").addEventListener("click", () => {
    splashScreen.style.display = "none";
    settingsScreen.style.display = "flex";
});

document.getElementById("settings-back").addEventListener("click", () => {
    settingsScreen.style.display = "none";
    splashScreen.style.display = "flex";
});

document.getElementById("toggle-fog").addEventListener("click", () => {
    fogEnabled = !fogEnabled;
    draw();
});

document.getElementById("end-turn").addEventListener("click", endTurn);

// ======= Init Game ======= //
function initGame() {
    canvas.width = window.innerWidth - 440;
    canvas.height = window.innerHeight - 20;
    cols = Math.floor(canvas.width / tileSize);
    rows = Math.floor(canvas.height / tileSize);

    generateMap();
    draw();
}

// ======= Map Generation ======= //
function generateMap() {
    map = [];
    objects = [];

    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            row.push({ visible: true });
        }
        map.push(row);
    }

    const earth = { id: 1, type: 'planet', owner: 'player', x: 2, y: 2 };
    const station = { id: 2, type: 'station', owner: 'player', x: 3, y: 2 };
    const frigate = {
        id: 3,
        type: 'frigate',
        owner: 'player',
        x: 3,
        y: 3,
        hasMoved: false,
        stats: { moveRange: 1 }
    };

    objects.push(earth, station, frigate);
}

// ======= Drawing ======= //
function drawGrid() {
    ctx.strokeStyle = "#333";
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

function drawObjects() {
    for (const obj of objects) {
        if (fogEnabled && !map[obj.y][obj.x].visible) continue;

        let emoji = "❓";
        if (obj.type === "planet") emoji = "🪐";
        else if (obj.type === "station") emoji = "🏭";
        else if (obj.type === "frigate") emoji = "🚀";

        ctx.font = `${tileSize * 0.8}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, obj.x * tileSize + tileSize / 2, obj.y * tileSize + tileSize / 2);

        if (selectedObject && selectedObject.id === obj.id) {
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x * tileSize, obj.y * tileSize, tileSize, tileSize);
        }
    }
}

function drawFog() {
    if (!fogEnabled) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawObjects();
    drawFog();
}

// ======= Interaction ======= //
canvas.addEventListener("click", e => {
    if (currentTurn !== 'player') return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);
    const clicked = objects.find(o => o.x === x && o.y === y);

    if (selectedObject && !clicked) {
        const dx = Math.abs(x - selectedObject.x);
        const dy = Math.abs(y - selectedObject.y);
        if (!selectedObject.hasMoved && dx <= selectedObject.stats.moveRange && dy <= selectedObject.stats.moveRange) {
            selectedObject.x = x;
            selectedObject.y = y;
            selectedObject.hasMoved = true;
        }
        selectedObject = null;
    } else if (clicked && clicked.owner === 'player' && clicked.type === 'frigate') {
        selectedObject = clicked;
    } else {
        selectedObject = null;
    }
    draw();
});

// ======= End Turn ======= //
function endTurn() {
    if (currentTurn !== 'player') return;
    currentTurn = 'enemy';

    setTimeout(() => {
        // Reset movement flags
        for (const obj of objects) {
            if (obj.owner === 'player') obj.hasMoved = false;
        }
        currentTurn = 'player';
        draw();
    }, 1000);
}
