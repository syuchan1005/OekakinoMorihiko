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

function ellipse(ctx, cx, cy, w, h){
    var lx = cx - w/2,
        rx = cx + w/2,
        ty = cy - h/2,
        by = cy + h/2;
    var magic = 0.551784;
    var xmagic = magic*w/2;
    var ymagic = h*magic/2;
    ctx.moveTo(cx,ty);
    ctx.bezierCurveTo(cx+xmagic,ty,rx,cy-ymagic,rx,cy);
    ctx.bezierCurveTo(rx,cy+ymagic,cx+xmagic,by,cx,by);
    ctx.bezierCurveTo(cx-xmagic,by,lx,cy+ymagic,lx,cy);
    ctx.bezierCurveTo(lx,cy-ymagic,cx-xmagic,ty,cx,ty);
}