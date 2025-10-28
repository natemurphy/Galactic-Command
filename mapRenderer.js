const ICONS = {
  playerBase: "🏰",
  frigate: "🚀",
  station: "🛸",
  planet: "🪐",
  asteroid: "⛰️",
  enemy: "⚔️",
  empty: "·",
  unexplored: "⬛"
};

let fogHidden = false;

export function generateMap(gameState) {
  const { map, width, height } = gameState;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!map[y][x].objectData) {
        const rand = Math.random();
        if (rand < 0.02) map[y][x].object = "enemy";
        else if (rand < 0.05) map[y][x].object = "planet";
        else if (rand < 0.1) map[y][x].object = "asteroid";
        else map[y][x].object = "empty";
      }
    }
  }
}

export function toggleFog() {
  fogHidden = !fogHidden;
}

export function renderMap(gameState) {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const { map, width, height } = gameState;
  const TILE_SIZE = Math.floor(window.innerHeight / height);

  canvas.width = TILE_SIZE * width;
  canvas.height = TILE_SIZE * height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${TILE_SIZE * 0.9}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = map[y][x];
      let icon = ICONS.unexplored;

      if (fogHidden || tile.explored || (tile.objectData && tile.objectData.owner === "player")) {
        if (tile.objectData) icon = ICONS[tile.objectData.type] || ICONS.empty;
        else icon = ICONS[tile.object] || ICONS.empty;
      }

      ctx.fillText(icon, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
    }
  }

  // Draw movement range for selected object
  const selected = getSelectedObject(gameState);
  if (selected && !selected.hasMoved && selected.owner === "player") {
    ctx.fillStyle = "rgba(0,255,255,0.2)";
    const range = selected.stats.moveRange;
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (dx === 0 && dy === 0) continue;
        const tx = selected.x + dx;
        const ty = selected.y + dy;
        if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
          const tile = map[ty][tx];
          if (!tile.objectData) {
            ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }
  }
}

// Helper to get currently selected object
function getSelectedObject(gameState) {
  for (let y = 0; y < gameState.height; y++) {
    for (let x = 0; x < gameState.width; x++) {
      const obj = gameState.map[y][x].objectData;
      if (obj && obj.selected) return obj;
    }
  }
  return null;
}
