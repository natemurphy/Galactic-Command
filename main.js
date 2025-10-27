// ======= Basic Game Setup ======= //
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 440; // subtract left/right panels
canvas.height = window.innerHeight - 20;

const tileSize = 40;
const cols = Math.floor(canvas.width / tileSize);
const rows = Math.floor(canvas.height / tileSize);

// ======= Game State ======= //
let map = [];
let objects = [];
let selectedObject = null;
let currentTurn = 'player'; // 'player' or 'enemy'
let fogEnabled = true;

// ======= DOM Elements ======= //
const splashScreen = document.getElementById("splash-screen");
const settingsScreen = document.getElementById("settings-screen");
const gameContainer = document.getElementById("game-container");
const fileInput = document.getElementById("file-input");

// ======= Splash Screen Buttons ======= //
document.getElementById("new-game").addEventListener("click", () => {
    splashScreen.style.display = "none";
    gameContainer.style.display = "grid";
    generateMap();
    draw();
});

document.getElementById("load-game").addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const savedState = JSON.parse(event.target.result);
        map = savedState.map;
        objects = savedState.objects;
        selectedObject = null;
        splashScreen.style.display = "none";
        gameContainer.style.display = "grid";
        draw();
    };
    reader.readAsText(file);
});

document.getElementById("settings-btn").addEventListener("click", () => {
    splashScreen.style.display = "none";
    settingsScreen.style.display = "flex";
});

document.getElementById("settings-back").addEventListener("click", () => {
    settingsScreen.style.display = "none";
    splashScreen.style.display = "flex";
});

// ======= Fog Toggle ======= //
document.getElementById("toggle-fog").addEventListener("click", () => {
    fogEnabled = !fogEnabled;
    draw();
});

// ======= Generate Map ======= //
function generateMap() {
    map = [];
    objects = [];
    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            row.push({ visible: true }); // initial fog placeholder
        }
        map.push(row);
    }

    // Player base (Earth)
    const earth = { id: 1, type: 'planet', owner: 'player', x: 2, y: 2 };
    objects.push(earth);

    // Space station next to Earth
    const stationTile = findEmptyAdjacentTile(earth.x, earth.y);
    if (stationTile) {
        objects.push({
            id: 2,
            type: 'station',
            owner: 'player',
            x: stationTile.x,
            y: stationTile.y,
            hp: 500
        });
    }

    // Starter ship (frigate) spawn
    let frigateX = 3;
    let frigateY = 3;
    if (stationTile) {
        if (!isOccupied(stationTile.x, stationTile.y + 1)) {
            frigateX = stationTile.x;
            frigateY = stationTile.y + 1;
        } else {
            const fallback = findEmptyAdjacentTile(earth.x, earth.y);
            if (fallback) {
                frigateX = fallback.x;
                frigateY = fallback.y;
            }
        }
    }

    objects.push({
        id: 3,
        type: 'frigate',
        owner: 'player',
        x: frigateX,
        y: frigateY,
        hasMoved: false,
        stats: {
            moveRange: 1,
            miningSpeed: 5,
            hp: 100,
            damage: 10
        }
    });
}

// ======= Helper Functions ======= //
function findEmptyAdjacentTile(x, y) {
    const offsets = [
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
        { dx: -1, dy: 0 },                  { dx: 1, dy: 0 },
        { dx: -1, dy: 1 },  { dx: 0, dy: 1 },  { dx: 1, dy: 1 }
    ];
    for (let o of offsets) {
        const tx = x + o.dx;
        const ty = y + o.dy;
        if (tx >= 0 && tx < cols && ty >= 0 && ty < rows) {
            if (!isOccupied(tx, ty)) return { x: tx, y: ty };
        }
    }
    return null;
}

function getObjectAtTile(x, y) {
    return objects.find(o => o.x === x && o.y === y);
}

function isOccupied(x, y) {
    return !!getObjectAtTile(x, y);
}

function tileFromMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    return { x: Math.floor(mx / tileSize), y: Math.floor(my / tileSize) };
}

// ======= Drawing ======= //
function drawGrid() {
    ctx.strokeStyle = "#222";
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

function drawObjects() {
    for (let obj of objects) {
        if (fogEnabled && !map[obj.y][obj.x].visible) continue;

        let color;
        switch (obj.type) {
            case 'planet': color = 'blue'; break;
            case 'station': color = 'cyan'; break;
            case 'frigate': color = 'red'; break;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(obj.x * tileSize + tileSize / 2, obj.y * tileSize + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
        ctx.fill();

        if (selectedObject && selectedObject.id === obj.id) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x * tileSize, obj.y * tileSize, tileSize, tileSize);
        }
    }
}

function drawMovementRange(obj) {
    if (!obj || obj.hasMoved || obj.owner !== 'player') return;
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    for (let dx = -obj.stats.moveRange; dx <= obj.stats.moveRange; dx++) {
        for (let dy = -obj.stats.moveRange; dy <= obj.stats.moveRange; dy++) {
            if (dx === 0 && dy === 0) continue;
            const tx = obj.x + dx;
            const ty = obj.y + dy;
            if (tx >= 0 && tx < cols && ty >= 0 && ty < rows && !isOccupied(tx, ty)) {
                ctx.fillRect(tx * tileSize, ty * tileSize, tileSize, tileSize);
            }
        }
    }
}

// ======= Input ======= //
canvas.addEventListener("click", e => {
    if (currentTurn !== 'player') return;
    const { x, y } = tileFromMouse(e);
    const clicked = getObjectAtTile(x, y);

    if (selectedObject && !clicked) {
        const dx = Math.abs(x - selectedObject.x);
        const dy = Math.abs(y - selectedObject.y);
        if (dx <= selectedObject.stats.moveRange && dy <= selectedObject.stats.moveRange && !isOccupied(x, y)) {
            selectedObject.x = x;
            selectedObject.y = y;
            selectedObject.hasMoved = true;
            selectedObject = null;
        }
    } else if (clicked && clicked.owner === 'player' && clicked.type === 'frigate') {
        selectedObject = clicked;
    } else {
        selectedObject = null;
    }
    draw();
});

// ======= End Turn ======= //
document.getElementById("end-turn").addEventListener("click", () => {
    if (currentTurn !== 'player') return;
    endPlayerTurn();
});

function endPlayerTurn() {
    currentTurn = 'enemy';
    // AI Placeholder
    setTimeout(() => {
        for (let obj of objects) {
            if (obj.owner === 'player' && obj.type === 'frigate') obj.hasMoved = false;
        }
        currentTurn = 'player';
        draw();
    }, 1000);
}

// ======= Draw Cycle ======= //
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawObjects();
    if (selectedObject) drawMovementRange(selectedObject);
}

// ======= Start Game ======= //
// Map is generated when "Start New Game" is clicked via splash screen
