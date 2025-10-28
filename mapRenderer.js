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

export function toggleFog() {
  fogHidden = !fogHidden;
}

export function renderMap(gameState) {
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
}
