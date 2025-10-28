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

export function toggleFog() {
  fogHidden = !fogHidden;
}

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

  // Draw selected ship highlights
  if (selectedShip && !selectedShip.hasMoved) {
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      selectedShip.x * TILE_SIZE,
      selectedShip.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );

    ctx.strokeStyle = "cyan";
    const moves = [
      { x: selectedShip.x + 1, y: selectedShip.y },
      { x: selectedShip.x - 1, y: selectedShip.y },
      { x: selectedShip.x, y: selectedShip.y + 1 },
      { x: selectedShip.x, y: selectedShip.y - 1 },
      { x: selectedShip.x + 1, y: selectedShip.y + 1 },
      { x: selectedShip.x - 1, y: selectedShip.y - 1 },
      { x: selectedShip.x + 1, y: selectedShip.y - 1 },
      { x: selectedShip.x - 1, y: selectedShip.y + 1 },
    ];

    for (const m of moves) {
      if (
        m.x >= 0 && m.y >= 0 && m.x < width && m.y < height &&
        (!map[m.y][m.x].object)
      ) {
        ctx.strokeRect(m.x * TILE_SIZE, m.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
