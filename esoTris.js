window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');

    setBoard(); /* debugBoard(); */
    createGradient();
    loadImage();
};

var canvas, ctx, grad;
var imgCd;      /* Center, Day   */
var imgCn;      /* Center, Night */
var imgWd = []; /* Wings,  Day   */
var imgWn = []; /* Wings,  Night */

var board = [];

var piece = [0, 4, 1, 1]; /* type, pos, ori */
var loopCount = 0;

function main() { /* "키 입력 -> 새로운 block 상태 계산 -> 렌더링" 반복 */
    if (loopCount === 0) {
        console.log("rotate: "+rotate(piece, 1));
        console.log("move: "+move(piece, [0,1])[0]);
        console.log("piece: "+piece);
    }
    render();
    loopCount++;
    loopCount = loopCount % 50;
}

/* move */

function move(piece, way) {
    var type = piece[0], x = piece[1], y = piece[2]; ori = piece[3];
    removePieceFromBoard(piece);
    var newPiece = [type, x + way[0], y + way[1], ori]
    var moved;
    if (available(newPiece)) {
        placePieceOnBoard(newPiece);
        piece[1] = piece[1] + way[0];
        piece[2] = piece[2] + way[1];
        moved = true;
    } else {
        placePieceOnBoard(piece);
        moved = false;
    }
    newPiece[2] = newPiece[2] + 1;
    return [moved, available(newPiece)]; /* 움직였는가? 다음 턴 아래에 공간이 있는가? */
}

function rotate(piece, dO) { /* dO 는 delta Orientation */
    var type = piece[0], x = piece[1], y = piece[2]; ori = piece[3];
    removePieceFromBoard(piece);
    var testPiece;
    var placeToMove = [[0,0],[0,-1],[-dO,-1],[dO,-1],[-dO,0],[dO,0],[0,1],[-dO,1],[dO,1]];
    for(let i = 0; i < 9; i++) {
        testPiece = [type, x + placeToMove[i][0], y + placeToMove[i][1], (ori + dO) % 8]
        if (available(testPiece)) {
            placePieceOnBoard(testPiece);
            piece[1] = piece[1] + placeToMove[i][0];
            piece[2] = piece[2] + placeToMove[i][1];
            piece[3] = (piece[3] + dO) % 8;
            return true;
        }
    }
    placePieceOnBoard(piece);
    return false;
}

/* behind the scenes */

function removePieceFromBoard(piece) {
    var type = piece[0], x = piece[1], y = piece[2]; ori = piece[3];
    var occupyData = checkOccupy(piece);
    for(let i = 0; i < 3; i++) {
        board[occupyData[i][1]+3][occupyData[i][0]] = -1;
    }
}

function placePieceOnBoard(piece) {
    var type = piece[0], x = piece[1], y = piece[2]; ori = piece[3];
    var occupyData = checkOccupy(piece);
    if (available(piece)) {
        board[occupyData[0][1]+3][occupyData[0][0]] = 0;
        board[occupyData[1][1]+3][occupyData[1][0]] = occupyData[3][0] + 1;
        board[occupyData[2][1]+3][occupyData[2][0]] = occupyData[3][1] + 1;
    }
}

function checkOccupy(piece) {
    var type = piece[0], x = piece[1], y = piece[2]; ori = piece[3];
    var angle = [ori % 8, (4 - type + ori) % 8];
    var delta = [[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1]];
    return [[x, y], [x + delta[angle[0]][0], y + delta[angle[0]][1]], [x + delta[angle[1]][0], y + delta[angle[1]][1]], angle]; /* occupyData */
}

function available(piece) {
    var type = piece[0], x = piece[1], y = piece[2]; ori = piece[3];
    var occupyData = checkOccupy(piece);
    var X, Y;
    for(let i = 0; i < 3; i++) {
        X = occupyData[i][0]
        Y = occupyData[i][1]
        if (!((0 <= X) && (X < 9) && (-3 <= Y) && (Y < 16)))
            return false;
        if (board[Y+3][X] !== -1)
            return false;
    }
    return true;
}

/* ctx */

function render() {
    ctx.clearRect(0, 0, 380, 660); /* 추후 바뀔 수 있음 */
    drawGradient();
    placeBlocks();
    drawGrid();
    drawBorder();
}

function loadImage() {
    imgCd = new Image();
    imgCd.onload = checkLoad;
    imgCd.src = "images/cd.png";
    
    imgCn = new Image();
    imgCn.onload = checkLoad;
    imgCn.src = "images/cn.png";
    
    for(let i=0; i < 8; i++) {
        imgWd[i] = new Image();
        imgWd[i].onload = checkLoad;
        imgWd[i].src = "images/wd_" + i + ".png";
    
        imgWn[i] = new Image();
        imgWn[i].onload = checkLoad;
        imgWn[i].src = "images/wn_" + i + ".png";
    }
}

var count = 10;

function checkLoad() {
    count = count - 1;
    if(count === 0) {
        setInterval(main, 10); /* 얼마나 빨리 화면이 바뀌는지 결정 */
    }
}

function createGradient() {
    grad = ctx.createLinearGradient(0, 0, 0, 40 * 16);
    grad.addColorStop(0, "#CCC");
    grad.addColorStop(1, "#333");
}

function drawGradient() {
    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(10, 10, 10 + 40*9, 10 + 40*16);
    ctx.restore();
}

function placeBlocks() {
    ctx.save();
    var imgToDraw;
    for(let i=0; i < 16; i++) {
        for(let j=0; j < 9; j++) {
            imgToDraw = -1;
            if (board[i+3][j] == 0) {
                imgToDraw = imgCd;
            } else if ((1 <= board[i+3][j]) && (board[i+3][j] < 9)) {
                imgToDraw = imgWd[board[i+3][j] - 1];
            } else if (board[i+3][j] == 9) {
                imgToDraw = imgCn;
            } else if ((10 <= board[i+3][j]) && (board[i+3][j] < 18)) {
                imgToDraw = imgWn[board[i+3][j] - 10];
            }
            if (imgToDraw !== -1)
                ctx.drawImage(imgToDraw, 10 + 40 * j, 10 + 40 * i);
        }
    }
    ctx.restore();
}

function drawGrid() {
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    for(let i=1; i < 16; i++) {
        ctx.beginPath();
        ctx.moveTo(10, 10 + 40*i)
        ctx.lineTo(10 + 40*9, 10 + 40*i)
        ctx.stroke();
    }
    for(let j=1; j < 9; j++) {
        ctx.beginPath();
        ctx.moveTo(10 + 40*j, 10)
        ctx.lineTo(10 + 40*j, 10 + 40*16)
        ctx.stroke();
    }
    ctx.restore();
}

function drawBorder() {
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 10;
    ctx.lineJoin = "round";
    ctx.strokeRect(5 + 1, 5 + 1, 40 * 9 + 10 - 2, 40 * 16 + 10 - 2);
    ctx.restore();
}

function setBoard() {
    for(let i = -3; i < 16; i++) {
        board[i+3] = [];
        for(let j = 0; j < 9; j++) {
            board[i+3][j] = -1;
        }
    }
}

function debugBoard() {
    board = [[-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [ 0, 1,-1,-1,-1,-1,-1,-1,-1],
             [ 7,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1]];
}

function template() {
    ctx.save();
    ctx.restore();
}