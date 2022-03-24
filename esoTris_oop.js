// board & pieces
var pieceList = [], piece, renderState="game", gameCount=0, removeCount, toRemove, biasDayNight=0, score=0; /* type, pos, ori */ // biasdaynight, 0: day, 9: night
const ELEM_IDS = ["buttonDayNight", "GitHub-Mark", "canvas", "Tris"], elems = {}, ctx;

// window onload
const windowPromise = new Promise((resolve, reject) => {
    window.onload = function () {
        for(let i=0; i < ELEM_IDS.length; i++) {
            elems[ELEM_ID[i]] = document.getElementById(ELEM_ID[i])
        }
        ctx = elems["canvas"].getContext('2d');
        ctx.save(); // the only save
        for (let i = 0; i < 3; i++) {
            pushPiece();
        }
        pieceList[0][2] = 2;
        setBoard();
        placePieceOnGrid(pieceList[0]);
        createGradient();
        resolve();
    };
});

// keyboard
var userKey = {'i': 0, 'j': 0, 'k': 0, 'l': 0, 'n': 0, '.': 0, 'z': 0, 'x': 0};
document.addEventListener('keydown', (event) => {if(renderState === "game"){userKey[event.key]++;}});

// colors
const colors = {};
createColors(colors);

// download assets; https://github.com/vzhou842/example-.io-game/blob/master/src/client/assets.js; https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
const assets = {};
const ASSET_NAMES = ["rmvr.png", "sun.png", "moon.png", "cd.png", "cn.png"];
for(let i=0; i < 8; i++) {
    ASSET_NAMES.push(`wd_${i}.png`);
    ASSET_NAMES.push(`wn_${i}.png`);
}
function downloadAsset(assetName) {
    return new Promise(resolve => {
        const asset = new Image();
        asset.onload = () => {
            assets[assetName] = asset;
            resolve();
        };
        asset.src = `images/${assetName}`;
    });
}
const assetsPromises = ASSET_NAMES.map(downloadAsset);

const allPromises = assetsPromises.concat([windowPromise]);
Promise.all(allPromises).then(() => {
    setInterval(renderFrame, 5); // 화면이 업데이트되는 속도 결정
});

function renderFrame() {
    if(renderState === "game") {
        gameCount++;
        gameCount = gameCount % 300;
        
        piece = pieceList[0];
        var moveResult;
        var next = false;
        if(gameCount === 0) {userKey.k = 1;}
        
        if(userKey.k > 0) {userKey.k = 0; moveResult = move(piece, [0, 1]); downCount=0; if((!moveResult[0])&&(!moveResult[1])) {next = true;}}
        if(userKey.j > 0) {userKey.j = 0; move(piece, [-1, 0]);}
        if(userKey.l > 0) {userKey.l = 0; move(piece, [1, 0]);}
        if(userKey['n'] > 0) {userKey['n'] = 0; moveResult = move(piece, [-1, 1]); if(moveResult[0]) {gameCount=0;} if((!moveResult[0])&&(!moveResult[1])) {next = true;}}
        if(userKey['.'] > 0) {userKey['.'] = 0; moveResult = move(piece, [1, 1]); if(moveResult[0]) {gameCount=0;} if((!moveResult[0])&&(!moveResult[1])) {next = true;}}
        if(userKey.z > 0) {userKey.z = 0; rotate(piece, 1);}
        if(userKey.x > 0) {userKey.x = 0; rotate(piece, -1);}
        if(userKey.i > 0) {userKey.i = 0; hardDrop(piece, [0, 1]); next = true;}
        
        renderGame();
        
        if(next) {
            switchState(piece);
            pieceList.shift();
            pushPiece();

            if(checkOver()) {
                renderState = "gameover";
            }

            toRemove = checkThree();
            if(toRemove.length > 0) {
                renderState = "remove";
                removeCount = 150;
            }
        }
    }
    
    if(renderState === "remove") {
        renderRemove();
        removeCount--;
        if(removeCount === 0) {
            removeLines();
            score = score + 300;
            renderState = "game";
        }
    }

    if(renderState === "gameover") {
        renderGameover();
    }
    
    canvas.style.margin = "10px " + Math.floor((document.body.clientWidth - padding * 2 - 380)/2) + "px 10px";
}

class Grid {
    constructor(ctx, x, y, sideL, bThick, wNum, hNum) {
        this.ctx = ctx; this.x = x; this.y = y; this.sideL = sideL; this.bThick = bThick; this.wNum = wNum; this.hNum = hNum;
        this.width = wNum * sideL; this.height = hNum * sideL;
        this.board = [];
        for(let i = 0; i < 9; i++) {
            this.board[i] = [];
            for(let j = -3; j < 16; j++) {
                this.board[i][j] = -1;
            }
        }
    }
    
    draw() {
        this.ctx.translate(x, y);
        this.drawBoard();
        this.ctx.restore();
    }
    
    removePieceFromGrid(piece) {
        for(let i = 0; i < 3; i++) {
            this.board[piece.occupyData.all[i][0]][piece.occupyData.all[i][1]] = -1;
        }
    }
    
    placePieceOnGrid(piece) {
        if (this.available(piece)) {
            this.board[piece.occupyData.center[0]][piece.occupyData.center[1]] = 0;
            this.board[piece.occupyData.wings[0][0]][piece.occupyData.wings[0][1]] = piece.occupyData.angle[0] + 1;
            this.board[piece.occupyData.wings[1][0]][piece.occupyData.wings[1][1]] = piece.occupyData.angle[1] + 1;
        }
    }
    
    checkOver() {
        for(let i = 0; i < 9; i++) {
            for(let j = -3; j < 0; j++) {
                if(board[i][j] > 0) return true;
            }
        }
        return false;
    }

    checkThree() {
        var filledRows = [];
        var checker;
        for(let j = 0; j < 16; j++) {
            checker = true;
            for(let i = 0; i < 9; i++) {
                if(board[i][j] === -1) {
                    checker = false;
                    break;
                }
            }
            filledRows[j] = checker;
        }
        var index = [];
        var indexAdder = 0;
        while(indexAdder < 14) {
            if(filledRows[indexAdder] && filledRows[indexAdder+1] && filledRows[indexAdder+2]) {
                index.push(indexAdder);
                indexAdder = indexAdder + 3;
            } else {
                indexAdder = indexAdder + 1;
            }
        }
        return index;
    }
    
    removeLinesOnGrid(toRemove) {
        for(let k=0; k < toRemove.length; k++) {
            for(let j = toRemove[k]+2; j > -1; j--) {
                for(let i = 0; i < 9; i++) {
                    board[i][j] = board[i][j-3];
                }
            }
            for(let j = -1; j > -4; j--) {
                for(let i = 0; i < 9; i++) {
                    board[i][j] = -1;
                }
            }
        }
    }
    
    available(piece) {
        for(let i = 0; i < 3; i++) {
            var X = piece.occupyData.all[i][0]
            var Y = piece.occupyData.all[i][1]
            if (!((0 <= X) && (X < 9) && (-3 <= Y) && (Y < 16))) return false;
            if (board[X][Y] !== -1) return false;
        }
        return true;
    }
    
    getHardDropPos(piece, way) {
        this.removePieceFromGrid(piece);
        var newPiece = new Piece(piece.type, piece.x, piece.y, piece.ori);
        var i = 0;
        while(this.available(newPiece)) {
            i++;
            newPiece = new Piece(piece.type, piece.x + way[0] * i, piece.y + way[1] * i, piece.ori);
        }
        this.placePieceOnGrid(piece);
        return new Piece(piece.type, piece.x + way[0] * (i-1), piece.y + way[1] * (i-1), piece.ori);
    }
    
    drawBoard() {
        var imgToDraw;
        for(let i = 0; i < 9; i++) {
            for(let j = -3; j < 16; j++) {
                var boardTile = board[i][j];
                if(boardTile > -1) {
                    if (boardTile == 0) {
                        imgToDraw = assets[`cd.png`];
                    } else if ((1 <= boardTile) && (boardTile < 9)) {
                        imgToDraw = assets[`wd_${boardTile - 1}.png`];
                    } else if (boardTile == 9) {
                        imgToDraw = assets[`cn.png`];
                    } else if ((10 <= boardTile) && (boardTile < 18)) {
                        imgToDraw = assets[`wn_${boardTile - 10}.png`];
                    }
                    this.ctx.drawImage(imgToDraw, 10 + 40 * j, 10 + 40 * i);
                }
            }
        }
    }
    
    drawBorder() {
        this.ctx.lineWidth = this.bThick + 1;
        this.ctx.lineJoin = "round";
        this.ctx.strokeRect((1 - this.bThick)/2, (1 - this.bThick)/2, this.width + this.bThick - 1, this.height + this.bThick - 1);
    }
    
    drawGrid() {
        this.ctx.lineWidth = 2;
        for(let i = 1; i < this.wNum; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.sideL * i, 0);
            this.ctx.lineTo(this.sideL * i, this.height);
            this.ctx.stroke();
        }
        for(let j = 1; j < this.hNum; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.sideL * j);
            this.ctx.lineTo(this.width, this.sideL * j);
            this.ctx.stroke();
        }
    }

    drawEnding() {
        this.ctx.fillStyle = SEMI_TRANSPARENT_BLACK;
        this.ctx.fillRect(-this.bThick, -this.bThick, this.width + 2*this.bThick, this.height + 2*this.bThick);
        this.ctx.fillStyle = WHITE;
        this.ctx.textAlign = "center";
        this.ctx.font = "60px SF_IceLemon"
        this.ctx.fillText("끝", this.width / 2, this.height / 2 - 90);
        this.ctx.font = "30px SF_IceLemon"
        this.ctx.fillText(score, this.width / 2, this.height / 2 + 90);
    }
    
    drawTriangles(piece) {
        var occupyData;
        var colors = [GOOGLE_BLUE, GOOGLE_PURPLE_J, GOOGLE_PURPLE_P];
        var ways = [[0, 1], [-1, 1], [1, 1]];
        var tri = [[[11, 29, 20, 11], [5, 5, 14, 5]], [[5, 55, 17, 5], [23, 35, 35, 23]], [[35, 35, 23, 35], [23, 35, 35, 23]]];
        this.ctx.strokeStyle = WHITE;
        this.ctx.lineWidth = 2;
        for(let s = 0; s < 3; s++) {
            var newPiece = this.getHardDropPos(piece, ways[s]);
            for(let t = 0; t < 3; t++) {
                var X = newPiece.occupyData.all[t][0];
                var Y = newPiece.occupyData.all[t][1];
                this.ctx.fillStyle = colors[s];
                this.ctx.beginPath();
                this.ctx.moveTo(40 * X + tri[s][0][0], 40 * Y + tri[s][1][0]);
                for(let u = 0; u < 3; u++) {
                    this.ctx.lineTo(40 * X + tri[s][0][u], 40 * Y + tri[s][1][u])
                }
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
    }
    
    drawGradient() {
        this.ctx.fillStyle = grad;
        this.fillRect(0, 0, this.width, this.height);
    }
}

function moveOnGrid(grid, piece, way) {
    grid.removePieceFromGrid(piece);
    var newPiece = moved(piece, way);
    var didMove;
    if (grid.available(newPiece)) {
        grid.placePieceOnGrid(newPiece);
        piece = newPiece;
        didMove = true;
    } else {
        grid.placePieceOnGrid(piece);
        didMove = false;
    }
    grid.removePieceFromGrid(piece);
    var testPiece = moved(piece, [0, 1]);
    var canMoveDown = grid.available(testPiece);
    grid.placePieceOnGrid(piece);
    return {"didMove":didMove, "canMoveDown":canMoveDown}; /* 움직였는가? 다음 턴 아래에 공간이 있는가? */
}

function rotateOnGrid(grid, piece, deltaOri) {
    var delta = [[0, 0], [-deltaOri, 0], [deltaOri, 0], [0, 1], [-deltaOri, 1], [deltaOri, 1], [0, -1], [-deltaOri, -1], [deltaOri, -1]];
    grid.removePieceFromGrid(piece);
    for(let s = 0; s < 9; s++) {
        var newPiece = moved(rotated(piece, deltaOri * 2), delta[s]);
        if (grid.available(newPiece)) {
            grid.placePieceOnGrid(newPiece);
            piece = newPiece;
            return {"didMove":true};
        }
    }
    grid.placePieceOnGrid(piece);
    return {"didMove":false};
}

function hardDropOnGrid(grid, piece, way) {
    newPiece = grid.getHardDropPos(piece, way);
    grid.removePieceFromGrid(piece);
    piece = newPiece;
    grid.placePieceOnGrid(piece);
    return {"canMoveDown":grid.available(moved(piece, [0, 1]))};
}

class Piece {
    constructor(type, x, y, ori) {
        this.type = type; this.x = x; this.y = y;
        if(ori < 0)
            this.ori = 8 - (-ori)%8;
        else
            this.ori = ori % 8;
        this.delta = [[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1]];
    }
    get occupyData() {
        var angle = [this.ori % 8, (4 - this.type + this.ori) % 8];
        var getWing = i => [this.x+this.delta[angle[i]][0], this.y+this.delta[angle[i]][1]];
        return {all:[[this.x, this.y], getWing(0), getWing(1)], center:[this.x, this.y], wings:[getWing(0), getWing(1)], angle:angle};
    }
}

// move
function moved(piece, way) {
    return new Piece(piece.type, piece.x + way[0], piece.y + way[1], piece.ori);
}

function rotated(piece, deltaOri) {
    return new Piece(piece.type, piece.x, piece.y, (piece.ori + deltaOri + 8) % 8);
}

function copied(piece) {
    return new Piece(piece.type, piece.x, piece.y, piece.ori);
}

// random
function gRI(min, max) { // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

function pushPiece(pieceList) {
    pieceList.push(new Piece(gRI(0, 3), 4, -2, gRI(0, 8));
}

/* behind the scenes */

// ctx
function createColors(colors) {
    colors.GOOGLE_BLUE = "rgb(59, 134, 202)";
    colors.GOOGLE_PURPLE_P = "rgb(120, 88, 187)";
    colors.GOOGLE_PURPLE_J = "rgb(158, 77, 182)";
    colors.BLACK = "#000";
    colors.WHITE = "#FFF";
    colors.SEMI_TRANSPARENT_BLACK = "rgba(0, 0, 0, 0.7)";
}

function createGradient() {
    grad = ctx.createLinearGradient(0, 0, 0, 40 * 16);
    grad.addColorStop(0, "#888");
    grad.addColorStop(1, "#444");
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

/* ctx coordinates */

var padding = 310;

function renderGame() {
    ctx.clearRect(0, 0, 380 + padding * 2, 660); /* 추후 바뀔 수 있음 */
    drawGradient();
    drawTriangles(piece);
    drawBoard();
    drawGridMain();
    drawSidePiece(padding + 380 + 4 + 5 + 20 * 2, 10 + 40 + 2 * 20, pieceList[1]);
    drawSidePiece(padding + 380 + 4 + 5 + 20 * 2, 10 + 40 + 6 * 20, pieceList[2]);
    drawGridSide();
    drawScore();
    drawBorderMain();
    drawBorderSide();
}

function renderRemove() {
    ctx.clearRect(0, 0, 380 + padding * 2, 660);
    drawGradient();
    drawBoard();
    placeRemove();
    drawGridMain();
    drawSidePiece(padding + 380 + 4 + 5 + 20 * 2, 10 + 40 + 2 * 20, pieceList[1]);
    drawSidePiece(padding + 380 + 4 + 5 + 20 * 2, 10 + 40 + 6 * 20, pieceList[2]);
    drawGridSide();
    drawScore();
    drawBorderMain();
    drawBorderSide();
}

function renderGameover() {
    ctx.clearRect(0, 0, 380 + padding * 2, 660);
    drawGradient();
    drawBoard();
    drawGridMain();
    drawSidePiece(padding + 380 + 4 + 5 + 20 * 2, 10 + 40 + 2 * 20, pieceList[1]);
    drawSidePiece(padding + 380 + 4 + 5 + 20 * 2, 10 + 40 + 6 * 20, pieceList[2]);
    drawGridSide();
    drawBorderMain();
    drawBorderSide();
    drawEnding();
}
    
function drawSidePiece(x, y, piece) {
    var occupyData = checkOccupy(piece);
    var imgToDraw;
    var px, py, a;
    
    px=occupyData[0][0] - 4; py=occupyData[0][1] + 2;
    if (biasDayNight == 0)
        imgToDraw = assets[`cn.png`];
    else
        imgToDraw = assets[`cd.png`];
    ctx.drawImage(imgToDraw, 0, 0, 40, 40, x + 20*px, y + 20*py, 20, 20);
    
    px=occupyData[1][0] - 4; py=occupyData[1][1] + 2;
    a = occupyData[3][0];
    if (biasDayNight == 0)
        imgToDraw = assets[`wn_${a}.png`];
    else
        imgToDraw = assets[`wd_${a}.png`];
    ctx.drawImage(imgToDraw, 0, 0, 40, 40, x + 20*px, y + 20*py, 20, 20);
    
    px=occupyData[2][0] - 4; py=occupyData[2][1] + 2;
    a = occupyData[3][1];
    if (biasDayNight == 0)
        imgToDraw = assets[`wn_${a}.png`];
    else
        imgToDraw = assets[`wd_${a}.png`];
    ctx.drawImage(imgToDraw, 0, 0, 40, 40, x + 20*px, y + 20*py, 20, 20);
}

function placeRemove() {
    ctx.fillStyle = "#00F";
    for(let i=0; i < toRemove.length; i++) {
        ctx.drawImage(rmvr, -45 + padding, 10 + 40* toRemove[i] + 10);
    }
    ctx.restore();
}

function drawScore() {
    ctx.fillStyle = GOOGLE_BLUE;
    ctx.font = "30px SF_IceLemon"
    ctx.fillText(score, padding + 380 + 5, 30);
    ctx.restore();
}

function switchDayNight() {
    if(biasDayNight === 0)
        biasDayNight = 9;
    else
        biasDayNight = 0;

    if(biasDayNight === 0) {
        document.body.style.background = "#FFF";
        buttonDayNight.style.background = "url(images/moon.png)";
        GitHub_Mark.setAttribute("src", "images/GitHub-Mark/PNG/GitHub-Mark-32px.png");
        Tris.style.color = "#000";
    }
    else {
        document.body.style.background = "#000";
        buttonDayNight.style.background = "url(images/sun.png)";
        GitHub_Mark.setAttribute("src", "images/GitHub-Mark/PNG/GitHub-Mark-Light-32px.png");
        Tris.style.color = "#FFF";
    }
}