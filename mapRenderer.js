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

// --- Render the map with optional selected ship highlighting ---
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

  // Draw tiles and objects
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = map[y][x];

      let icon = ICONS.unexplored;
      if (fogHidden || tile.explored) {
        if (tile.objectData) {
          icon = ICONS[tile.objectData.type] || ICONS.empty;
        } else {
          icon = ICONS[tile.object] || ICONS.empty;
        }
      }

      ctx.fillText(icon, x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2);
    }
  }

  // Draw selected ship highlight and move range
  if (selectedShip) {
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;

    // Highlight the selected tile
    ctx.strokeRect(
      selectedShip.x * TILE_SIZE,
      selectedShip.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );

    // Highlight valid move tiles (unoccupied and in bounds)
    const moves = [
      { x: selectedShip.x + 1, y: selectedShip.y },
      { x: selectedShip.x - 1, y: selectedShip.y },
      { x: selectedShip.x, y: selectedShip.y + 1 },
      { x: selectedShip.x, y: selectedShip.y - 1 },
      { x: selectedShip.x + 1, y: selectedShip.y + 1 },
      { x: selectedShip.x - 1, y: selectedShip.y - 1 },
      { x: selectedShip.x + 1, y: selectedShip.y - 1 },
      { x: selectedShip.x - 1, y: selectedShip.y + 1 }
    ];

    ctx.strokeStyle = "cyan";
    for (const m of moves) {
      if (
        m.x >= 0 &&
        m.y >= 0 &&
        m.x < width &&
        m.y < height &&
        !map[m.y][m.x].objectData // only highlight empty tiles
      ) {
        ctx.strokeRect(m.x * TILE_SIZE, m.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

// --- Toggle fog ---
export function toggleFog() {
  fogHidden = !fogHidden;
}
