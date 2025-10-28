// ======= Canvas Setup =======
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const tileSize = 40;

// ======= Game State =======
let cols = 0;
let rows = 0;
let map = [];
let objects = [];
let selectedObject = null;
let currentTurn = 'player';
let fogEnabled = true;

// ======= DOM Elements =======
const splashScreen = document.getElementById('splash-screen');
const settingsScreen = document.getElementById('settings-screen');
const gameScreen = document.getElementById('game-container');
const shipInfo = document.getElementById('ship-info');
const turnIndicator = document.getElementById('turn-indicator');

// ======= Emoji Icons =======
const ICONS = {
    planet: '🪐',
    station: '🏭',
    frigate: '🚀',
    empty: '·'
};

// ======= Helper Functions =======
function getObjectAtTile(x, y) {
    return objects.find(o => o.x === x && o.y === y);
}

function isOccupied(x, y) {
    return !!getObjectAtTile(x, y);
}

function findEmptyAdjacentTile(x, y) {
    const offsets = [
        {dx:-1,dy:-1},{dx:0,dy:-1},{dx:1,dy:-1},
        {dx:-1,dy:0},           {dx:1,dy:0},
        {dx:-1,dy:1},{dx:0,dy:1},{dx:1,dy:1}
    ];
    for (let o of offsets) {
        const tx = x + o.dx;
        const ty = y + o.dy;
        if(tx>=0 && tx<cols && ty>=0 && ty<rows && !isOccupied(tx,ty)) return {x:tx,y:ty};
    }
    return null;
}

function tileFromMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    return { x: Math.floor(mx / tileSize), y: Math.floor(my / tileSize) };
}

// ======= Map & Object Generation =======
function generateMap() {
    // Calculate number of columns/rows based on map area
    const mapArea = document.getElementById('map-area');
    canvas.width = mapArea.clientWidth;
    canvas.height = mapArea.clientHeight;

    cols = Math.floor(canvas.width / tileSize);
    rows = Math.floor(canvas.height / tileSize);

    // Generate empty map
    map = [];
    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            row.push({ type: 'empty', visible: true });
        }
        map.push(row);
    }

    objects = [];

    // Player planet
    const earth = { id:1, type:'planet', owner:'player', x:2, y:2 };
    objects.push(earth);

    // Station next to Earth
    const stationTile = findEmptyAdjacentTile(earth.x, earth.y);
    if(stationTile) {
        objects.push({id:2,type:'station',owner:'player',x:stationTile.x,y:stationTile.y,hp:500});
    }

    // Starter frigate
    let frigX = 3, frigY = 3;
    if(stationTile && !isOccupied(stationTile.x, stationTile.y + 1)) {
        frigX = stationTile.x;
        frigY = stationTile.y + 1;
    } else {
        const fallback = findEmptyAdjacentTile(earth.x, earth.y);
        if(fallback){ frigX = fallback.x; frigY = fallback.y; }
    }
    objects.push({id:3,type:'frigate',owner:'player',x:frigX,y:frigY,hasMoved:false,stats:{moveRange:1,hp:100,damage:10}});

    draw();
}

// ======= Drawing =======
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.font = `${tileSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for(let y=0;y<rows;y++){
        for(let x=0;x<cols;x++){
            let obj = getObjectAtTile(x,y);
            let icon = obj ? ICONS[obj.type] : ICONS.empty;
            let alpha = 1;

            // dim tiles if ship is selected
            if(selectedObject){
                if(!obj || (obj.owner!=='player' || obj.hasMoved)) alpha = 0.3;
            }
            // dim moved ships
            if(obj && obj.owner==='player' && obj.hasMoved) alpha = 0.5;

            ctx.globalAlpha = alpha;
            ctx.fillText(icon, x*tileSize + tileSize/2, y*tileSize + tileSize/2);
        }
    }

    // Draw movement range
    if(selectedObject && !selectedObject.hasMoved){
        ctx.fillStyle = 'rgba(0,255,255,0.3)';
        ctx.globalAlpha = 1;
        for(let dx=-selectedObject.stats.moveRange; dx<=selectedObject.stats.moveRange; dx++){
            for(let dy=-selectedObject.stats.moveRange; dy<=selectedObject.stats.moveRange; dy++){
                if(dx===0 && dy===0) continue;
                const tx = selectedObject.x + dx;
                const ty = selectedObject.y + dy;
                if(tx>=0 && tx<cols && ty>=0 && ty<rows && !isOccupied(tx,ty)){
                    ctx.fillRect(tx*tileSize, ty*tileSize, tileSize, tileSize);
                }
            }
        }
    }
    ctx.globalAlpha = 1;
}

// ======= Input Handling =======
canvas.addEventListener('click', e=>{
    if(currentTurn!=='player') return;
    const {x,y} = tileFromMouse(e);
    const clicked = getObjectAtTile(x,y);

    if(selectedObject && !clicked){
        const dx = Math.abs(x-selectedObject.x);
        const dy = Math.abs(y-selectedObject.y);
        if(dx<=selectedObject.stats.moveRange && dy<=selectedObject.stats.moveRange && !isOccupied(x,y)){
            selectedObject.x=x;
            selectedObject.y=y;
            selectedObject.hasMoved=true;
            selectedObject=null;
            shipInfo.innerText='';
        }
    } else if(clicked && clicked.owner==='player' && clicked.type==='frigate'){
        selectedObject=clicked;
        shipInfo.innerText = `Move: ${selectedObject.stats.moveRange}`;
    } else { selectedObject=null; shipInfo.innerText=''; }

    draw();
});

// ======= Turn System =======
document.getElementById('end-turn').addEventListener('click',()=>{
    if(currentTurn!=='player') return;
    for(let obj of objects){
        if(obj.owner==='player') obj.hasMoved=false;
    }
    currentTurn='player';
    draw();
});

// ======= Fog Toggle =======
document.getElementById('toggle-fog').addEventListener('click', ()=>{
    fogEnabled = !fogEnabled;
    draw();
});

// ======= Screen Switching =======
document.getElementById('new-game').addEventListener('click',()=>{
    splashScreen.style.display = 'none';
    gameScreen.style.display = 'grid';
    generateMap();
});
document.getElementById('settings-btn').addEventListener('click',()=>{
    splashScreen.style.display='none';
    settingsScreen.style.display='flex';
});
document.getElementById('settings-back').addEventListener('click',()=>{
    settingsScreen.style.display='none';
    splashScreen.style.display='flex';
});

// ======= Window Resize =======
window.addEventListener('resize', ()=>{
    if(gameScreen.style.display!=='none'){
        generateMap();
    }
});
