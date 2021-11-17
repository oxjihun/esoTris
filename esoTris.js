window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');
    createGradient();
    loadImage();
};

var canvas;
var ctx;
var grad;

var imgCd; /* Center, Day   */
var imgCn; /* Center, Night */
var imgWd = []; /* Wings, Day   */
var imgWn = []; /* Wings, Night */

var board = [];
for(let i = -3; i < 16; i++) {
    board[i+3] = [];
    for(let j = 0; j < 9; j++) {
        board[i+3][j] = -1;
    }
}

/* 디버깅, 첫 세 행은 화면 밖을 의미함 */
var board = [[-1,-1,-1,-1,-1,-1,-1,-1,-1],
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
             [-1,-1,-1,-1,-1,-1,-1,-1,-1]]
/**/

var currentPieceType = 0;
var currentPos = [4, -2];
var currentOrientation = 1;

function main() { /* "키 입력 -> 새로운 block 상태 계산 -> 렌더링" 반복 */
    board[0 + 3][0] = Math.floor(Math.random() * 17)
    render();
}

function checkOccupy(pieceType, pos, orientation) {
    var angle = [orientation % 8, (4 - pieceType + orientation) % 8];
    var delta = [[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1]];
    return [pos, [pos[0] + delta[angle[0]][0], pos[1] + delta[angle[0]][1]], [pos[0] + delta[angle[1]][0], pos[1] + delta[angle[1]][1]], angle];
}

function moveK() {
    return 0;
}

function render() {
    ctx.save();
    ctx.clearRect(0, 0, 380, 660); /* 추후 바뀔 수 있음 */
    drawGradient();
    placeBlocks();
    drawGrid();
    drawBorder();
    ctx.restore();
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
        setInterval(main, 100); /* 얼마나 빨리 화면이 바뀌는지 결정 */
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

function template() {
    ctx.save();
    ctx.restore();
}