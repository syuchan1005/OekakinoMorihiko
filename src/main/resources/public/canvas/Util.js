function openCanvasPng(canvas) {
    var type = 'image/png';
    var bin = atob(canvas.toDataURL(type).split(',')[1]);
    var buffer = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
    }
    window.open(window.URL.createObjectURL(new Blob([buffer.buffer], {type: type})));
}

function fillCanvas(context2D, width, height, color, alpha) {
    context2D.beginPath();
    context2D.fillStyle = color;
    context2D.globalAlpha = alpha;
    context2D.fillRect(0, 0, width, height);
}