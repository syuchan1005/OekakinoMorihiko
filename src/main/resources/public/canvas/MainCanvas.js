//初期値（サイズ、色、アルファ値、マウス）の決定
var size = 5;
var color = "#555555";
var alpha = 1.0;

var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext('2d');

var selectId;

// canvas初期化
clearCanvas();

// イベントリスナ
canvas.addEventListener('mousedown', function (e) {
    if (e.button === 0) {
        var rect = e.target.getBoundingClientRect();
        var X = ~~(e.clientX - rect.left);
        var Y = ~~(e.clientY - rect.top);
        clickProcess(X, Y);
    }
}, false);

canvas.addEventListener('mousemove', function (e) {
    if (e.buttons === 1 || e.witch === 1) {
        var rect = e.target.getBoundingClientRect();
        var X = ~~(e.clientX - rect.left);
        var Y = ~~(e.clientY - rect.top);
        sendDraw("paint", size, color, alpha, X, Y);
    }
}, false);

canvas.addEventListener('mouseup', sendDrawEnd, false);
canvas.addEventListener('mouseout', sendDrawEnd, false);

if (window.TouchEvent) {
    canvas.addEventListener('touchstart', function (e) {
        var touches = e.touches.item(0);
        var rect = e.target.getBoundingClientRect();
        var X = ~~(touches.clientX - rect.left);
        var Y = ~~(touches.clientY - rect.top);
        clickProcess(X, Y);
    }, false);
    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        var touches = e.touches.item(0);
        var rect = e.target.getBoundingClientRect();
        var X = ~~(touches.clientX - rect.left);
        var Y = ~~(touches.clientY - rect.top);
        sendDraw("paint", size, color, alpha, X, Y);
    }, false);
    canvas.addEventListener('touchend', sendDrawEnd, false);
    canvas.addEventListener('touchcancel', sendDrawEnd, false);
}

function sendDrawEnd() {
    sendDraw("paint", "DrawEnd");
}

function clickProcess(X, Y) {
    if (selectId != undefined) {
        switch (selectId) {
            case "spoit":
                var spoitImage = ctx.getImageData(X, Y, 1, 1);
                colorInput.value = '#' + (((256 + spoitImage.data[0] << 8) + spoitImage.data[1] << 8) + spoitImage.data[2]).toString(16).slice(1);
                onInputColor();
                break;
            case "fill":
                sendDraw("fill", 0, color, alpha, X, Y);
                break;
        }
        toggleSelectable(undefined);
    } else {
        sendDraw("paint", size, color, alpha, X, Y);
    }
}

function clearCanvas() {
    fillCanvas(ctx, canvas.width, canvas.height, "#f5f5f5", 1);
}

document.getElementById("downloadPng").addEventListener("click", openCanvasPng, false);
