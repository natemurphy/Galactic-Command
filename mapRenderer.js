const TILE_SIZE = 16;
let fogHidden = false;

const ICONS = {
    playerBase: "🏰",
    playerShip: "🚀",
    planet: "🪐",
    asteroid: "⛰️",
    enemy: "⚔️",
    empty: "·",
    unexplored: "⬛"
};

export function generateMap(gameState) {
    const { map, size } = gameState;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (map[y][x].object) continue;

            const rand = Math.random();
            if (rand < 0.02) map[y][x].object = "enemy";
            else if (rand < 0.05) map[y][x].object = "planet";
            else if (rand < 0.1) map[y][x].object = "asteroid";
            else map[y][x].object = "empty";
        }
    }
}

export function toggleFog(gameState) {
    fogHidden = !fogHidden;
}

export function renderMap(gameState) {
    const canvas = document.getElementById("game-canvas");
    const { map, size } = gameState;

    canvas.width = TILE_SIZE * size;
    canvas.height = TILE_SIZE * size;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${TILE_SIZE}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const tile = map[y][x];
            let icon;

            if (fogHidden || tile.explored) {
                icon = ICONS[tile.object] || ICONS.empty;
            } else {
                icon = ICONS.unexplored;
            }

            ctx.fillText(icon, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
        }
    }
}
