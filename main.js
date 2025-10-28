// ======= Canvas & Context =======
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const tileSize = 50; // base emoji size
let cols, rows;

// ======= Game State =======
let map = [];
let objects = [];
let selectedObject = null;
let currentTurn = 'player';
let fogEnabled = true;

// ======= DOM Elements =======
const splashScreen = document.getElementById("splash-screen");
const settingsScreen = document.getElementById("settings-screen");
const gameScreen = document.getElementById("game-screen");

// ======= Emoji Icons =======
const ICONS = {
    empty: '⬛',
    planet: '🪐',
    station: '🏰',
    frigate: '🚀'
};

// ======= Helper Functions =======
function getObjectAtTile(x, y) {
    return objects.find(o => o.x === x && o.y === y);
}

function isOccupied(x, y) {
    return !!getObjectAtTile(x, y);
}

function findEmptyAdjacentTile(x, y) {
    const offsets = [
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
        { dx: -1, dy: 0 },                   { dx: 1, dy: 0 },
        { dx: -1, dy: 1 },  { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
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

function tileFromMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    return { x: Math.floor(mx / tileSize), y: Math.floor(my / tileSize) };
}

// ======= Map & Objects =======
function generateMap() {
    // calculate cols/rows based on canvas size
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    cols = Math.floor(canvas.width / tileSize);
    rows = Math.floor(canvas.height / tileSize);

    // create empty map
    map = [];
    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            row.push({ type: 'empty', visible: true });
        }
        map.push(row);
    }

    objects = [];

    // Player planet at (2,2)
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

    // Starter frigate
    let frigateX = 3, frigateY = 3;
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
            hp: 100,
            damage: 10
        }
    });
}

// ======= Drawing =======
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${tileSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const obj = getObjectAtTile(x, y);
            let icon = ICONS.empty;

            if (obj) {
                icon = ICONS[obj.type] || ICONS.empty;
            }

            let alpha = 1;
            if (selectedObject) {
                // dim all except selectable tiles
                if (!obj && Math.abs(x - selectedObject.x) <= selectedObject.stats.moveRange &&
                    Math.abs(y - selectedObject.y) <= selectedObject.stats.moveRange) {
                    alpha = 1;
                } else if (obj && obj.type === 'frigate' && obj.hasMoved) {
                    alpha = 0.3;
                } else {
                    alpha = 0.3;
                }
            }

            ctx.globalAlpha = alpha;
            ctx.fillText(icon, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
        }
    }

    // draw movement range overlay
    if (selectedObject && !selectedObject.hasMoved) {
        ctx.fillStyle = 'rgba(0,255,255,0.2)';
        for (let dx = -selectedObject.stats.moveRange; dx <= selectedObject.stats.moveRange; dx++) {
            for (let dy = -selectedObject.stats.moveRange; dy <= selectedObject.stats.moveRange; dy++) {
                if (dx === 0 && dy === 0) continue;
                const tx = selectedObject.x + dx;
                const ty = selectedObject.y + dy;
                if (tx >= 0 && tx < cols && ty >= 0 && ty < rows && !isOccupied(tx, ty)) {
                    ctx.fillRect(tx * tileSize, ty * tileSize, tileSize, tileSize);
                }
            }
        }
    }

    ctx.globalAlpha = 1;
}

// ======= Input =======
canvas.addEventListener('click', e => {
    if (currentTurn !== 'player') return;
    const { x, y } = tileFromMouse(e);
    const clicked = getObjectAtTile(x, y);

    if (selectedObject && !clicked) {
        // check move range
        const dx = Math.abs(x - selectedObject.x);
        const dy = Math.abs(y - selectedObject.y);
        if (dx <= selectedObject.stats.moveRange &&
            dy <= selectedObject.stats.moveRange &&
            !isOccupied(x, y) &&
            !selectedObject.hasMoved
        ) {
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

// ======= Fog Toggle =======
document.getElementById('toggle-fog').addEventListener('click', () => {
    fogEnabled = !fogEnabled;
    draw();
});

// ======= End Turn =======
document.getElementById('end-turn').addEventListener('click', () => {
    if (currentTurn !== 'player') return;

    currentTurn = 'enemy'; // placeholder, no AI
    for (let obj of objects) {
        if (obj.type === 'frigate' && obj.owner === 'player') obj.hasMoved = false;
    }
    currentTurn = 'player';
    draw();
});

// ======= Screen Switching =======
document.getElementById("new-game").addEventListener("click", () => {
    splashScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    generateMap();
    draw();
});

document.getElementById("settings-btn").addEventListener("click", () => {
    splashScreen.classList.add("hidden");
    settingsScreen.classList.remove("hidden");
});

document.getElementById("settings-back").addEventListener("click", () => {
    settingsScreen.classList.add("hidden");
    splashScreen.classList.remove("hidden");
});
