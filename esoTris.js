window.onload = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext('2d');
    drawGrid(ctx);
};

function drawGrid(ctx) {
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
}