var cCanvas = document.getElementById("coverCanvas");
var cCtx = cCanvas.getContext('2d');

var fLoc = [];

cCanvas.addEventListener('mousedown', function (e) {
    if (e.button === 0) {
        var rect = e.target.getBoundingClientRect();
        fLoc.X = ~~(e.clientX - rect.left);
        fLoc.Y = ~~(e.clientY - rect.top);
    }
}, false);

cCanvas.addEventListener('mousemove', function (e) {
    if (e.buttons === 1 || e.witch === 1) {
        var rect = e.target.getBoundingClientRect();
        var X = ~~(e.clientX - rect.left);
        var Y = ~~(e.clientY - rect.top);
        claerCoverCanvas();
        cCtx.beginPath();
        cCtx.globalAlpha = alpha;
        cCtx.strokeStyle = color;
        cCtx.lineWidth = size;
        switch (selectId) {
            case "square":
                cCtx.strokeRect(fLoc.X, fLoc.Y, (fLoc.X - X) * -1, (fLoc.Y - Y) * -1);
                break;
            case "circle":
                cCtx.arc(150, 150, 150, 0, Math.PI * 2, true);
                break;
        }
        cCtx.stroke();
    }
}, false);

cCanvas.addEventListener('mouseup', function (e) {
    if (e.button === 0) {
        var rect = e.target.getBoundingClientRect();
        sendSpecialDraw(selectId,
            size, color, alpha,
            fLoc.X, fLoc.Y,
            ~~(e.clientX - rect.left), ~~(e.clientY - rect.top));
        toggleSelectable(undefined);
        noneCoverCanvas();
    }
}, false);

function claerCoverCanvas() {
    cCtx.clearRect(0, 0, 1280, 720);
    fillCanvas(cCtx, 1280, 720, "#555555", 0.5);
}

function showCoverCanvas() {
    claerCoverCanvas();
    cCanvas.style.display = "block";
    cCanvas.style.pointerEvents = "auto";
}

function noneCoverCanvas() {
    cCanvas.style.display = "none";
    cCanvas.style.pointerEvents = "none";
}