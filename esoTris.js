window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');

    for(let i = 0; i < 3; i++) {
        pushPiece();
    }
    setBoard(); /* debugBoard(); */
    placePieceOnBoard(pieceList[0]);

    createGradient();
    loadImage();
};

var canvas, ctx, grad;
var imgCd;      /* Center, Day   */
var imgCn;      /* Center, Night */
var imgWd = []; /* Wings,  Day   */
var imgWn = []; /* Wings,  Night */

var board = [];
var pieceList = []; /* type, pos, ori */
var loopCount = 0;

function main() { /* "키 입력 -> 새로운 block 상태 계산 -> 렌더링" 반복 */
    /* var debugTimeStart = performance.now(); */
    piece = pieceList[0];
    var moveResult;
    var next = false;
    if(loopCount === 0) {userKey.k = 1;}

    if(userKey.k > 0) {userKey.k = 0; moveResult = move(piece, [0, 1]); if((!moveResult[0])&&(!moveResult[1])) {next = true;}}
    if(userKey.j > 0) {userKey.j = 0; move(piece, [-1, 0]);}
    if(userKey.l > 0) {userKey.l = 0; move(piece, [1, 0]);}
    if(userKey['m'] > 0) {userKey['m'] = 0; moveResult = move(piece, [-1, 1]); if((!moveResult[0])&&(!moveResult[1])) {next = true;}}
    if(userKey['.'] > 0) {userKey['.'] = 0; moveResult = move(piece, [1, 1]); if((!moveResult[0])&&(!moveResult[1])) {next = true;}}
    if(userKey.z > 0) {userKey.z = 0; rotate(piece, 1);}
    if(userKey.x > 0) {userKey.x = 0; rotate(piece, -1);}
    if(userKey.i > 0) {userKey.i = 0; hardDrop(piece, [0, 1]); next = true;}

    render();
    loopCount++;
    loopCount = loopCount % 300;

    if(next) {
        switchState(piece);
        pieceList.shift();
        pushPiece();
    }

    /* console.log(next); */
    /* var debugTimeEnd = performance.now();*/
    /* console.log(debugTimeEnd - debugTimeStart); */
}

/* initialize */

function gRI(min, max) { /* https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Math/random */
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

function pushPiece() {
    pieceList.push([gRI(0, 3), 4, -2, gRI(0, 8)]);
}

/* keyboard */

var userKey = {'i':0, 'j':0, 'k':0, 'l':0, 'm':0, '.':0, 'z':0, 'x':0};
document.addEventListener('keydown', (event) => {userKey[event.key]++;});

/* move */

function move(piece, way) {
    var type = piece[0], x = piece[1], y = piece[2], ori = piece[3];
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
    removePieceFromBoard(piece);
    var testPiece = [type, piece[1], piece[2] + 1, ori];
    var a = available(testPiece);
    placePieceOnBoard(piece);
    return [moved, a]; /* 움직였는가? 다음 턴 아래에 공간이 있는가? */
}

function rotate(piece, dO) { /* dO 는 delta Orientation */
    var type = piece[0], x = piece[1], y = piece[2], ori = piece[3]; /* ; ori = piece[3]으로 하여 한동안 에러가 났었다. */
    removePieceFromBoard(piece);
    var testPiece;
    var placeToMove = [[0,0],[-dO,0],[dO,0],[0,-1],[-dO,-1],[dO,-1],[0,1],[-dO,1],[dO,1]];
    for(let i = 0; i < 9; i++) {
        testPiece = [type, x + placeToMove[i][0], y + placeToMove[i][1], (ori + dO + 8) % 8]
        if (available(testPiece)) {
            placePieceOnBoard(testPiece);
            piece[1] = piece[1] + placeToMove[i][0];
            piece[2] = piece[2] + placeToMove[i][1];
            piece[3] = (piece[3] + dO + 8) % 8;
            return true;
        }
    }
    placePieceOnBoard(piece);
    return false;
}

function hardDrop(piece, way) {
    var type = piece[0], x = piece[1], y = piece[2], ori = piece[3];
    newPiece = hardDropPos(piece, way);
    removePieceFromBoard(piece)
    piece[1] = newPiece[1];
    piece[2] = newPiece[2];
    placePieceOnBoard(piece);
    return available([piece[0], piece[1], piece[2]+1, piece[3]]);
}

/* behind the scenes */

function hardDropPos(piece, way) {
    var type = piece[0], x = piece[1], y = piece[2], ori = piece[3];
    removePieceFromBoard(piece);
    var newPiece = [type, x, y, ori];
    var i = 0;
    while(available(newPiece)) {
        i++;
        newPiece = [type, x + way[0] * i, y + way[1] * i, ori];
    }
    placePieceOnBoard(piece);
    return [type, x + way[0] * (i-1), y + way[1] * (i-1), ori];
}

function removePieceFromBoard(piece) {
    var type = piece[0], x = piece[1], y = piece[2], ori = piece[3];
    var occupyData = checkOccupy(piece);
    for(let i = 0; i < 3; i++) {
        board[occupyData[i][1]+3][occupyData[i][0]] = -1;
    }
}

function placePieceOnBoard(piece) {
    var type = piece[0], x = piece[1], y = piece[2], ori = piece[3];
    var occupyData = checkOccupy(piece);
    if (available(piece)) {
        board[occupyData[0][1]+3][occupyData[0][0]] = 0;
        board[occupyData[1][1]+3][occupyData[1][0]] = occupyData[3][0] + 1;
        board[occupyData[2][1]+3][occupyData[2][0]] = occupyData[3][1] + 1;
    }
}

function checkOccupy(piece) {
    var type = piece[0], x = piece[1], y = piece[2], ori = piece[3];
    var angle = [ori % 8, (4 - type + ori) % 8];
    var delta = [[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1]];
    return [[x, y], [x + delta[angle[0]][0], y + delta[angle[0]][1]], [x + delta[angle[1]][0], y + delta[angle[1]][1]], angle]; /* occupyData */
}

function available(piece) {
    var type = piece[0], x = piece[1], y = piece[2], ori = piece[3];
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
        setInterval(main, 5); /* 얼마나 빨리 화면이 바뀌는지 결정 */
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

function switchState(piece) {
    var type = piece[0], x = piece[1], y = piece[2], ori = piece[3];
    var occupyData = checkOccupy(piece);
    for(let i = 0; i < 3; i++) {
        X = occupyData[i][0]
        Y = occupyData[i][1]
        if ((0 <= board[Y+3][X])&&(board[Y+3][X] < 9)) {
            board[Y+3][X] = board[Y+3][X] + 9;
        } else if ((9 <= board[Y+3][X])&&(board[Y+3][X] < 18)) {
            board[Y+3][X] = board[Y+3][X] - 9;
        }
    }
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