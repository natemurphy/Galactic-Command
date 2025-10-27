// ======= Basic Game Setup ======= //
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 440; // subtract left/right panels
canvas.height = window.innerHeight - 20;

const tileSize = 40;
const cols = Math.floor(canvas.width / tileSize);
const rows = Math.floor(canvas.height / tileSize);

// Game state
let map = [];
let objects = [];
let selectedObject = null;
let currentTurn = 'player'; // player or enemy

// ======= Generate Map ======= //
function generateMap() {
    map = [];
    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            row.push({ visible: true }); // fog placeholder
        }
        map.push(row);
    }

    // Player base (Earth)
    objects.push({ id: 1, type: 'planet', owner: 'player', x: 2, y: 2 });
    // Space station near base
    objects.push({ id: 2, type: 'station', owner: 'player', x: 3, y: 2 });
    // Starter ship (frigate)
    objects.push({
        id: 3,
        type: 'frigate',
        owner: 'player',
        x: 3,
        y: 3,
        hasMoved: false,
        stats: {
            moveRange: 1,
            miningSpeed: 5,
            hp: 100,
            damage: 10
        }
    });
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
        let color;
        switch (obj.type) {
            case 'planet': color = 'blue'; break;
            case 'station': color = 'gray'; break;
            case 'frigate': color = 'red'; break;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
            obj.x * tileSize + tileSize / 2,
            obj.y * tileSize + tileSize / 2,
            tileSize / 3,
            0, Math.PI * 2
        );
        ctx.fill();

        // highlight if selected
        if (selectedObject && selectedObject.id === obj.id) {
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                obj.x * tileSize,
                obj.y * tileSize,
                tileSize, tileSize
            );
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
            if (tx >= 0 && tx < cols && ty >= 0 && ty < rows) {
                if (!isOccupied(tx, ty)) {
                    ctx.fillRect(tx * tileSize, ty * tileSize, tileSize, tileSize);
                }
            }
        }
    }
}

// ======= Helpers ======= //
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
    return {
        x: Math.floor(mx / tileSize),
        y: Math.floor(my / tileSize)
    };
}

// ======= Input ======= //
canvas.addEventListener("click", e => {
    if (currentTurn !== 'player') return;

    const { x, y } = tileFromMouse(e);
    const clicked = getObjectAtTile(x, y);

    if (selectedObject && !clicked) {
        // try to move
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
    document.getElementById("turn-indicator").textContent = "Turn: Enemy";

    // AI Placeholder
    setTimeout(() => {
        for (let obj of objects) {
            if (obj.owner === 'player' && obj.type === 'frigate') {
                obj.hasMoved = false;
            }
        }
        currentTurn = 'player';
        document.getElementById("turn-indicator").textContent = "Turn: Player";
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
generateMap();
draw();
