// [Write a Tetris game in JavaScript](https://www.youtube.com/watch?v=H2aW5V46khA)
// [Writing a 2-Player Tetris in JavaScript](https://www.youtube.com/watch?v=JJo5JpbuTTs)

const canvas = document.getElementById("canvasPlay") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;
canvas.width = 400;
canvas.height = 800;
context.scale(canvas.width/10, canvas.width/10); // =40

const blockHolder = document.getElementById("imgBlockHolder") as HTMLImageElement;

const nextBlock1 = document.getElementById("inb1") as HTMLImageElement;
const nextBlock2 = document.getElementById("inb2") as HTMLImageElement;
const nextBlock3 = document.getElementById("inb3") as HTMLImageElement;
const nextBlock4 = document.getElementById("inb4") as HTMLImageElement;
const nextBlock5 = document.getElementById("inb5") as HTMLImageElement;

const arena: number[][] = createMatrix(10, 20); // Array(20).fill(null).map(() => Array(12).fill(0));

const pieces = "IJLOSTZ";

const player = {
    pos: {x: 4, y: -6, sy: 19},
    matrix: createPiece(""),
    followingMatrixes: [...Array(5)].map(_=>pieces[pieces.length*Math.random()|0]),
    score: 0,
    holdBlockType: "",
    holdBlock: [] as number[][],
    useHolder: true
}

const blockImg1 = new Image();
const blockImg2 = new Image();
const blockImg3 = new Image();
const blockImg4 = new Image();
const blockImg5 = new Image();
const blockImg6 = new Image();
const blockImg7 = new Image();

blockImg1.src = '../res/a.png';
blockImg2.src = '../res/b.png';
blockImg3.src = '../res/c.png';
blockImg4.src = '../res/e.png';
blockImg5.src = '../res/f.png';
blockImg6.src = '../res/g.png';
blockImg7.src = '../res/h.png';

const blockPiece0 = '../res/empty_piece.png';
const blockPiece1 = '../res/i_piece.png';
const blockPiece2 = '../res/j_piece.png';
const blockPiece3 = '../res/l_piece.png';
const blockPiece4 = '../res/o_piece.png';
const blockPiece5 = '../res/s_piece.png';
const blockPiece6 = '../res/t_piece.png';
const blockPiece7 = '../res/z_piece.png'; 

const colors: object = {
    1: blockImg1,
    2: blockImg2,
    3: blockImg3,
    4: blockImg4,
    5: blockImg5,
    6: blockImg6,
    7: blockImg7,
};

const playerControls = {
    pause: "Escape",
    rotateLeft: "KeyZ",
    hold: "KeyC",
    hardDrop: "Space",
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    softDrop: "ArrowDown",
    rotateRight: "ArrowUp",
}

type offsetInterface = {
    x: number,
    y: number,
    sy: number
}

type playerInterface = {
    pos: offsetInterface,
    matrix: number[][]
}

document.addEventListener('keydown', e => {
    if(e.code === playerControls.moveLeft) playerMove(-1);
    if(e.code === playerControls.moveRight) playerMove(1);
    if(e.code === playerControls.softDrop) playerDown();
    if(e.code === playerControls.hardDrop) playerDrop();
    if(e.code === playerControls.rotateLeft) playerRotate(-1);
    if(e.code === playerControls.rotateRight) playerRotate(1);
    if(e.code === playerControls.hold && player.useHolder) {
        blockHolder.src = blockHolderChange(player.holdBlockType);
        if(!player.holdBlock.length) {
            player.holdBlock = player.matrix;
            playerReset()
        } else
            [player.holdBlock, player.matrix] = [player.matrix, player.holdBlock];
        player.useHolder = false;
    }
});


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

function blockHolderChange(type: string): string {
    switch (type) {
        case "I": return blockPiece1;
        case "J": return blockPiece2;
        case "L": return blockPiece3;
        case "O": return blockPiece4;
        case "S": return blockPiece5;
        case "T": return blockPiece6;
        case "Z": return blockPiece7;
        default: return blockPiece0;
    }
}

function collide(arena: number[][], player: playerInterface, py: number) {
    const [m, px] = [player.matrix, player.pos.x];
    for (let y=0; y<m.length; ++y) {
        for (let x=0; x<m[y].length; ++x) {
            if (m[y][x] !== 0 && 
                (arena[y+py] && 
                arena[y+py][x+px]) !== 0) {
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
    // context.fillStyle = "black";    // context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0, sy: 0})
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix:number[][], offset:offsetInterface): void {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value != 0) {
                context.globalAlpha = 1;
                context.drawImage(Object(colors)[value], x + offset.x, y + offset.y, 1, 1)
                context.globalAlpha = 0.3;
                context.drawImage(Object(colors)[value], x + offset.x, y + offset.sy, 1, 1)
                // context.fillStyle = Object(colors)[value];   // context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawShadow() {
    if (collide(arena, player, player.pos.sy)) 
        player.pos.sy--;
    else if (!collide(arena, player, player.pos.sy+1))
        player.pos.sy++
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
    if (collide(arena, player, player.pos.y)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerDrop() {
    while (!collide(arena, player, player.pos.y)) {
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
    if (collide(arena, player, player.pos.y)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const randomPiece = pieces[pieces.length * Math.random() | 0]
    player.matrix = createPiece(player.followingMatrixes[0]);
    player.holdBlockType = player.followingMatrixes[0]; 
    player.followingMatrixes.shift();
    player.followingMatrixes.push(randomPiece);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    player.useHolder = true;

    if (collide(arena, player, player.pos.y)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }

    nextBlock1.src = blockHolderChange(player.followingMatrixes[0]);
    nextBlock2.src = blockHolderChange(player.followingMatrixes[1]);
    nextBlock3.src = blockHolderChange(player.followingMatrixes[2]);
    nextBlock4.src = blockHolderChange(player.followingMatrixes[3]);
    nextBlock5.src = blockHolderChange(player.followingMatrixes[4]);
}

function playerRotate(dir: number) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player, player.pos.y)) {
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
    drawShadow();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById("gameScore")!.innerText = player.score.toString();
}

playerReset();
updateScore();
update();