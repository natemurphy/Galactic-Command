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
  try {
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

    // Draw tiles
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

    // Draw selected ship highlight and move range
    if (selectedShip) {
      // Highlight the ship itself
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selectedShip.x * TILE_SIZE,
        selectedShip.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );

      // Highlight moveable tiles (diagonal included)
      ctx.strokeStyle = "cyan";
      for (let dx = -selectedShip.stats.moveRange; dx <= selectedShip.stats.moveRange; dx++) {
        for (let dy = -selectedShip.stats.moveRange; dy <= selectedShip.stats.moveRange; dy++) {
          if (dx === 0 && dy === 0) continue; // skip current tile
          const tx = selectedShip.x + dx;
          const ty = selectedShip.y + dy;
          if (
            tx >= 0 &&
            ty >= 0 &&
            tx < width &&
            ty < height &&
            !map[ty][tx].object
          ) {
            ctx.strokeRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error rendering map:", err);
  }
}

// --- Toggle fog of war ---
export function toggleFog() {
  fogHidden = !fogHidden;
}
