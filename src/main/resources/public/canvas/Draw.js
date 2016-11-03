var locations = [];

function draw(sessionId, Size, Color, Alpha, X, Y) {
    ctx.beginPath();
    ctx.globalAlpha = Alpha;
    ctx.strokeStyle = Color;
    if (locations[sessionId] == undefined) {
        locations[sessionId] = {};
    }
    var location = locations[sessionId];
    location.X1 = location.X1 || X;
    location.Y1 = location.Y1 || Y;
    ctx.lineWidth = Size;
    ctx.lineCap = 'round';
    ctx.moveTo(location.X1, location.Y1);
    ctx.lineTo(X, Y);
    ctx.stroke();
    location.X1 = X;
    location.Y1 = Y;
    ctx.fill();
}

function drawEnd(sessionId) {
    if (locations[sessionId] == undefined) {
        locations[sessionId] = {};
    }
    var location = locations[sessionId];
    location.X1 = "";
    location.Y1 = "";
}

function removeDraw(sessionId) {
    locations[sessionId] = undefined;
}