export function initGameState() {
    const size = 100;
    const map = [];

    // Initialize empty map
    for (let y = 0; y < size; y++) {
        const row = [];
        for (let x = 0; x < size; x++) {
            row.push({
                explored: false,
                object: null
            });
        }
        map.push(row);
    }

    // Player base and ship at top-left
    map[0][0].object = "playerBase";
    map[0][1].object = "playerShip";
    map[0][0].explored = true;
    map[0][1].explored = true;

    return {
        map,
        size,
        playerPosition: { x: 1, y: 0 }
    };
}
