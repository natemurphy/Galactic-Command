const ICONS = {
  playerBase: "🏰",
  frigate: "🚀",
  planet: "🪐",
  asteroid: "⛰️",
  enemy: "⚔️",
  empty: "·",
  unexplored: "⬛"
};

let fogHidden = false;

// Generate map objects randomly (planets, asteroids, enemies, empty tiles)
export function generateMap(gameState) {
  const { map, width, height } = gameState;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map[y][x].object) continue;

      const rand = Math.random();
      if (rand < 0.02) map[y][x].object = "enemy";
      else if (rand < 0.05) map[y][x].object = "planet";
      else if (rand < 0.1) map[y][x].object = "asteroid";
      else map[y][x].object = "empty";
    }
  }
}

// Toggle fog of war on/off
export function toggleFog() {
  fogHidden = !fogHidden;
}

// Render the map and optionally highlight a selected ship
export function renderMap(gameState, selectedShip = null) {
  const canvas = document.getElementById("game-canvas");
  const { map, width, height } = gameState;
  const TILE_SIZE = Math.floor(canvas.clientHeight / height);

  canvas.width = TILE_SIZE * width;
  canvas.height = TILE_SIZE * height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${TILE_SIZE * 0.9}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw all tiles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
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

  // Highlight selected ship and its move range
  if (selectedShip) {
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;

    // Highlight selected ship tile
    ctx.strokeRect(
      selectedShip.x * TILE_SIZE,
      selectedShip.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );

    // Highlight valid move tiles
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];

    ctx.strokeStyle = "cyan";
    for (const dir of directions) {
      const tx = selectedShip.x + dir.dx;
      const ty = selectedShip.y + dir.dy;

      if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
        const targetTile = map[ty][tx];
        // Only highlight if no object is on the tile
        if (!targetTile.object || targetTile.object === "empty") {
          ctx.strokeRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }
}
