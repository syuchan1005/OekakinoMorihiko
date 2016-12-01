var mainContext = $("#mainCanvas")[0].getContext("2d");
var selfContext = $("#selfCanvas")[0].getContext('2d');
var coverContext = $("#coverCanvas")[0].getContext('2d');

var selectId;
var locations = [];
var fLoc = [];
var eLoc = [];

// MainCanvas
function margeMainCanvas(destContext) {
    var dstD = mainContext.getImageData(0, 0, 1280, 720);
    var src = destContext.getImageData(0, 0, 1280, 720).data;
    var dst = dstD.data;
    var sA, dA, len = dst.length;
    var sRA, sGA, sBA, dRA, dGA, dBA, dA2;
    var demultiply;

    for (var px = 0; px < len; px += 4) {
        sA = src[px + 3] / 255;
        dA = dst[px + 3] / 255;
        dA2 = (sA + dA - sA * dA);
        dst[px + 3] = dA2 * 255;

        sRA = src[px] / 255 * sA;
        dRA = dst[px] / 255 * dA;
        sGA = src[px + 1] / 255 * sA;
        dGA = dst[px + 1] / 255 * dA;
        sBA = src[px + 2] / 255 * sA;
        dBA = dst[px + 2] / 255 * dA;

        demultiply = 255 / dA2;

        dst[px] = (sRA + dRA - dRA * sA) * demultiply;
        dst[px + 1] = (sGA + dGA - dGA * sA) * demultiply;
        dst[px + 2] = (sBA + dBA - dBA * sA) * demultiply;
    }
    mainContext.putImageData(dstD, 0, 0);
}

// SelfCanvas
MouseEvent($("#selfCanvas"), clickProcess, function (X, Y) {
    sendDraw("paint", getSize(), getColor(), getAlpha(), X, Y);
});

$("#selfCanvas").on('mouseup', sendDrawEnd);
$("#selfCanvas").on('mouseout', sendDrawEnd);

if (window.TouchEvent) {
    TouchEvent($("#selfCanvas"), clickProcess, function (X, Y) {
        sendDraw("paint", getSize(), getColor(), getAlpha(), X, Y);
    });
    $("#selfCanvas").on('touchend', sendDrawEnd);
    $("#selfCanvas").on('touchcancel', sendDrawEnd);
}

function sendDrawEnd() {
    sendDraw("paint", "DrawEnd");
}

function clickProcess(X, Y) {
    if (selectId != undefined) {
        switch (selectId) {
            case "spoit":
                var spoit = mainContext.getImageData(X, Y, 1, 1).data;
                setColor('#' + (((256 + spoit[0] << 8) + spoit[1] << 8) + spoit[2]).toString(16).slice(1));
                break;
            case "fill":
                sendDraw("fill", 0, getColor(), getAlpha(), X, Y);
                break;
        }
        toggleSelectable(undefined);
    } else {
        sendDraw("paint", getSize(), getColor(), getAlpha(), X, Y);
    }
}

function clearCanvas() {
    fillCanvas(mainContext, 1280, 720, "#f5f5f5", 1);
}

function draw(sessionId, Size, Color, Alpha, X, Y) {
    selfContext.beginPath();
    selfContext.globalAlpha = Alpha;
    selfContext.strokeStyle = Color;
    if (locations[sessionId] == undefined) {
        locations[sessionId] = {};
    }
    var location = locations[sessionId];
    location.X1 = location.X1 || X;
    location.Y1 = location.Y1 || Y;
    selfContext.lineWidth = Size;
    selfContext.lineCap = 'round';
    selfContext.moveTo(location.X1, location.Y1);
    selfContext.lineTo(X, Y);
    selfContext.stroke();
    location.X1 = X;
    location.Y1 = Y;
}

function drawEnd(sessionId) {
    removeDraw(sessionId);
    margeMainCanvas(selfContext);
    selfContext.clearRect(0, 0, 1280, 720);
}

function removeDraw(sessionId) {
    if (locations[sessionId] == undefined) {
        locations[sessionId] = {};
    }
    var location = locations[sessionId];
    location.X1 = undefined;
    location.Y1 = undefined;
}

// CoverCanvas
MouseEvent($("#coverCanvas"), function (X, Y) {
    fLoc.X = X;
    fLoc.Y = Y;
}, moveCover);

$("#coverCanvas").on('mouseup', function (e) {
    if (e.button === 0) {
        var rect = e.target.getBoundingClientRect();
        sendDraw(selectId, getAlpha(), getColor(), getAlpha(), fLoc.X, fLoc.Y,
            ~~(e.clientX - rect.left), ~~(e.clientY - rect.top));
        toggleSelectable(undefined);
        noneCoverCanvas();
    }
});

if (window.TouchEvent) {
    TouchEvent($("#coverCanvas"), function (X, Y) {
            fLoc.X = X;
            fLoc.Y = Y;
        },
        function (X, Y) {
            moveCover((eLoc.X = X), (eLoc.Y = Y));
        });

    $("#coverCanvas").on("touchend", function () {
        sendDraw(selectId, getSize(), getColor(), getAlpha(), fLoc.X, fLoc.Y, eLoc.X, eLoc.Y);
        toggleSelectable(undefined);
        noneCoverCanvas();
    });
}

function moveCover(X, Y) {
    clearCoverCanvas();
    coverContext.beginPath();
    coverContext.globalAlpha = getAlpha();
    coverContext.strokeStyle = getColor();
    coverContext.lineWidth = getSize();
    drawCover(coverContext, selectId, fLoc.X, fLoc.Y, X, Y);
    coverContext.stroke();
}

function drawCover(context, id, x1, y1, x2, y2) {
    context.lineCap = 'round';
    var w = (x1 - x2) * -1;
    var h = (y1 - y2) * -1;
    switch (id) {
        case "square":
            context.strokeRect(x1, y1, w, h);
            break;
        case "circle":
            ellipse(context, x1 + w / 2.0, y1 + h / 2.0, w, h);
            break;
        case "line":
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            break;
    }
}

function clearCoverCanvas() {
    coverContext.clearRect(0, 0, 1280, 720);
    fillCanvas(coverContext, 1280, 720, "#555555", 0.5);
}

function showCoverCanvas() {
    clearCoverCanvas();
    $("#coverCanvas").css("display", "block");
    $("#coverCanvas").css("pointer-events", "auto");
}

function noneCoverCanvas() {
    $("#coverCanvas").css("display", "none");
    $("#coverCanvas").css("pointer-events", "none");
}

clearCanvas();
noneCoverCanvas();
