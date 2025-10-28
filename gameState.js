export function initGameState() {
  const width = 50;
  const height = 30;
  const map = [];

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push({
        explored: false,
        object: null,
        objectData: null
      });
    }
    map.push(row);
  }

  // Player base
  map[0][0].object = "playerBase";
  map[0][0].explored = true;
  map[0][0].objectData = {
    type: "playerBase",
    owner: "player",
    x: 0,
    y: 0
  };

  // Starter frigate
  map[0][1].object = "frigate";
  map[0][1].explored = true;
  map[0][1].objectData = {
    type: "frigate",
    owner: "player",
    x: 1,
    y: 0,
    selected: false,
    hasMoved: false,
    stats: {
      moveRange: 1,
      miningSpeed: 5,
      hp: 100,
      damage: 10
    }
  };

  return {
    map,
    width,
    height,
    playerPosition: { x: 1, y: 0 }
  };
}
