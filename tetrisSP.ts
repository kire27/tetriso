// [Write a Tetris game in JavaScript](https://www.youtube.com/watch?v=H2aW5V46khA)
// [Writing a 2-Player Tetris in JavaScript](https://www.youtube.com/watch?v=JJo5JpbuTTs)

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

canvas.width = 400;
canvas.height = 800;

context.scale(canvas.width/10, canvas.width/10); // =40

const arena: number[][] = createMatrix(10, 20); // Array(20).fill(null).map(() => Array(12).fill(0));

const player = {
    pos: {x: 4, y: -6},
    matrix: createPiece(""),
    score: 0
}

const blockImg1 = new Image();
const blockImg2 = new Image();
const blockImg3 = new Image();
const blockImg4 = new Image();
const blockImg5 = new Image();
const blockImg6 = new Image();
const blockImg7 = new Image();

blockImg1.src = './res/a.png';
blockImg2.src = './res/b.png';
blockImg3.src = './res/c.png';
blockImg4.src = './res/e.png';
blockImg5.src = './res/f.png';
blockImg6.src = './res/g.png';
blockImg7.src = './res/h.png';

const colors: object = {
    1: blockImg1,
    2: blockImg2,
    3: blockImg3,
    4: blockImg4,
    5: blockImg5,
    6: blockImg6,
    7: blockImg7,
    // 1: '#00ffff',
    // 2: '#0000ff',
    // 3: '#ffa500',
    // 4: '#ffff00',
    // 5: '#00ff00',
    // 6: '#ff00ff',
    // 7: '#ff0000',
};

const playerControls = {
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    moveDown: "ArrowDown",
    dropDown: "Space",
    rotateLeft: "Numpad0",
    rotateRight: "ArrowUp",
}

document.addEventListener('keydown', e => {
    if(e.code === playerControls.moveLeft) playerMove(-1);
    if(e.code === playerControls.moveRight) playerMove(1);
    if(e.code === playerControls.moveDown) playerDown();
    if(e.code === playerControls.dropDown) playerDrop();
    if(e.code === playerControls.rotateLeft) playerRotate(-1);
    if(e.code === playerControls.rotateRight) playerRotate(1);
});


type offsetInterface = {
    x: number,
    y: number
}

type playerInterface = {
    pos: offsetInterface,
    matrix: number[][]
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length-1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena: number[][], player: playerInterface) {
    const [m, o] = [player.matrix, player.pos];

    for (let y=0; y<m.length; ++y) {
        for (let x=0; x<m[y].length; ++x) {
            if (m[y][x] !== 0 && 
                (arena[y+o.y] && 
                arena[y+o.y][x+o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w: number, h: number): number[][] {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type: string): number[][] {
    if(type === "I") return [
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ]; else if(type === "J") return [
        [0, 2, 0],
        [0, 2, 0],
        [2, 2, 0],
    ]; else if(type === "L") return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3],
    ]; else if(type === "O") return [
        [4, 4],
        [4, 4],
    ]; else if(type === "S") return [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0],
    ]; else if(type === "T") return [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0],
    ]; else if(type === "Z") return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
    ]; else return createMatrix(3, 3);
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    // context.fillStyle = "black";
    // context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0})
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix:number[][], offset:offsetInterface): void {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value != 0) {
                context.drawImage(Object(colors)[value], x + offset.x, y + offset.y, 1, 1)
                
                context.drawImage(Object(colors)[value], x + offset.x, y + offset.y, 1, 1)


                // context.fillStyle = Object(colors)[value];
                // context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena: number[][], player: playerInterface) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDown() {
    player.pos.y++; 
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerDrop() {
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    dropCounter = 0;
}

function playerMove(dir: number) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = "IJLOSTZ";
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir: number) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix: number[][], dir: number) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [ 
                matrix[x][y], 
                matrix[y][x] 
            ] = [ 
                matrix[y][x], 
                matrix[x][y] 
            ];
        }
    }

    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    if(dropCounter > dropInterval) {
        playerDown();
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById("gameScore")!.innerText = player.score.toString();
}

playerReset();
updateScore();
update();