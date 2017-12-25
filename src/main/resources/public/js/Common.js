function toPNGBinary(canvas) {
    var type = 'image/png';
    var bin = atob(canvas.toDataURL(type).split(',')[1]);
    var binary = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
        binary[i] = bin.charCodeAt(i);
    }
    return binary;
}

function openCanvasPng() {
    window.open(window.URL.createObjectURL(new Blob([toPNGBinary($("#mainCanvas")).buffer], {type: 'image/png'})));
}

function fillCanvas(context2D, Width, Height, Color, Alpha) {
    context2D.beginPath();
    context2D.fillStyle = Color;
    context2D.globalAlpha = Alpha;
    context2D.fillRect(0, 0, Width, Height);
}

function ellipse(context2D, cx, cy, w, h) {
    var lx = cx - w / 2;
    var rx = cx + w / 2;
    var ty = cy - h / 2;
    var by = cy + h / 2;
    var magic = 0.551784;
    var xmagic = magic * w / 2;
    var ymagic = h * magic / 2;
    context2D.moveTo(cx, ty);
    context2D.bezierCurveTo(cx + xmagic, ty, rx, cy - ymagic, rx, cy);
    context2D.bezierCurveTo(rx, cy + ymagic, cx + xmagic, by, cx, by);
    context2D.bezierCurveTo(cx - xmagic, by, lx, cy + ymagic, lx, cy);
    context2D.bezierCurveTo(lx, cy - ymagic, cx - xmagic, ty, cx, ty);
}

if (String.prototype.format == undefined) {
    String.prototype.format = function (arg) {
        var rep_fn = undefined;
        if (typeof arg == "object") {
            rep_fn = function (m, k) {
                return arg[k];
            }
        } else {
            var args = arguments;
            rep_fn = function (m, k) {
                return args[parseInt(k)];
            }
        }
        return this.replace(/\{(\w+)\}/g, rep_fn);
    }
}

function getCurrentTime() {
    var now = new Date();
    return "{0}/{1}/{2} {3}:{4}:{5}".format(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
}

function MouseEvent(canvas, downFunc, moveFunc) {
    canvas.on('mousedown', function (e) {
        if (e.button === 0) {
            var rect = e.target.getBoundingClientRect();
            if (downFunc != undefined) downFunc(~~(e.clientX - rect.left), ~~(e.clientY - rect.top), e);
        }
    });
    canvas.on('mousemove', function (e) {
        if (e.buttons === 1 || e.witch === 1) {
            var rect = e.target.getBoundingClientRect();
            if (moveFunc != undefined) moveFunc(~~(e.clientX - rect.left), ~~(e.clientY - rect.top), e);
        }
    });
}

function TouchEvent(canvas, startFunc, moveFunc) {
    canvas.on("touchstart", function (e) {
        var touches = e.touches.item(0);
        var rect = e.target.getBoundingClientRect();
        if (startFunc != undefined) startFunc(~~(touches.clientX - rect.left), ~~(touches.clientY - rect.top), e);
    });
    canvas.on("touchmove", function (e) {
        e.preventDefault();
        var touches = e.touches.item(0);
        var rect = e.target.getBoundingClientRect();
        if (moveFunc != undefined) moveFunc(~~(touches.clientX - rect.left), ~~(touches.clientY - rect.top), e);
    });
}