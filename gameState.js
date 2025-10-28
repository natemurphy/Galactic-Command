export function initGameState() {
    // Map size
    const width = 50;
    const height = 30;
    const map = [];

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            row.push({
                explored: false,
                object: null
            });
        }
        map.push(row);
    }

    // Player starting objects
    map[0][0].object = "playerBase";
    map[0][1].object = "playerShip";
    map[0][0].explored = true;
    map[0][1].explored = true;

    return {
        map,
        width,
        height,
        playerPosition: { x: 1, y: 0 }
    };
}
