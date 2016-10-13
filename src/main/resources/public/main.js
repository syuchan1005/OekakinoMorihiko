(function () {
    var keepAlive;
    var webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/web/");
    webSocket.onopen = function (event) {
        keepAlive = setInterval(function () {
            webSocket.send("Keep-Alive");
        }, 150000);
    };
    webSocket.onclose = function (event) {
        clearInterval(keepAlive);
        alert("WebSocket connection closed")
    };

    var count = document.getElementById("sessioncount");
    webSocket.onmessage = function (event) {
        var json = JSON.parse(event.data);
        if (json.session_count == undefined) {
            count.innerHTML = "接続人数" + json.session_count_load + "人";
        } else {
            count.innerHTML = "接続人数" + json.session_count + "人";
            switch (json.mode) {
                case "paint":
                    if (json.size == "AllClear") {
                        canvasClear();
                    } else {
                        draw(json.size, json.color, json.alpha, json.x, json.y);
                    }
                    break;
                case "chat":
                    appendChat(json.text, false);
                    break;
                case "fill":
                    ctx.globalAlpha = json.alpha;
                    ctx.fillStyle = json.color;
                    ctx.fillFlood(json.x, json.y, 40);
                    break;
            }
        }
    };

    var canvas = document.getElementById("main_canvas");
    var ctx = canvas.getContext('2d');

    canvasClear();

    //初期値（サイズ、色、アルファ値、マウス）の決定
    var size = 5;
    var color = "#555555";
    var alpha = 1.0;

    var spoit = false;
    var fill = false;

    canvas.addEventListener('mousemove', onMove, false);
    canvas.addEventListener('mousedown', onClick, false);

    function onMove(e) {
        if (e.buttons === 1 || e.witch === 1) {
            var rect = e.target.getBoundingClientRect();
            var X = ~~(e.clientX - rect.left);
            var Y = ~~(e.clientY - rect.top);
            sendWebSocket("paint", size, color, alpha, X, Y);
            draw(size, color, alpha, X, Y);
        }
    }

    function onClick(e) {
        if (e.button === 0) {
            var rect = e.target.getBoundingClientRect();
            var X = ~~(e.clientX - rect.left);
            var Y = ~~(e.clientY - rect.top);
            if (spoit) {
                var spoitImage = ctx.getImageData(X, Y, 1, 1);
                colorInput.value = toColorCode(spoitImage.data[0], spoitImage.data[1], spoitImage.data[2]);
                onInputColor();
                spoit = false;
            } else if (fill) {
                ctx.globalAlpha = alpha;
                ctx.fillStyle = color;
                ctx.fillFlood(X, Y, 40);
                fill = false;
                sendWebSocket("fill", 0, color, alpha, X, Y);
            } else {
                sendWebSocket("paint", size, color, alpha, X, Y);
                draw(size, color, alpha, X, Y);
            }
        }
    }

    function toColorCode(r, g, b) {
        return '#' + (((256 + r << 8) + g << 8) + b).toString(16).slice(1);
    }


    function draw(Size, Color, Alpha, X, Y) {
        ctx.beginPath();
        ctx.globalAlpha = Alpha;
        ctx.fillStyle = Color;
        ctx.arc(X, Y, Size, 0, Math.PI * 2, false);
        ctx.fill();
    }

    function sendWebSocket(Mode, Size, Color, Alpha, X, Y) {
        var json = new Object();
        json.mode = Mode;
        json.size = Size;
        json.color = Color;
        json.alpha = Alpha;
        json.x = X;
        json.y = Y;
        webSocket.send(JSON.stringify(json));
    }

    function canvasClear() {
        ctx.beginPath();
        ctx.fillStyle = "#f5f5f5";
        ctx.globalAlpha = 1.0;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    document.getElementById("downloadPng").addEventListener("click", openCanvasPng, false);

    function openCanvasPng() {
        var type = 'image/png';
        var bin = atob(canvas.toDataURL(type).split(',')[1]);
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            buffer[i] = bin.charCodeAt(i);
        }
        var url = window.URL.createObjectURL(new Blob([buffer.buffer], {type: type}));
        window.open(url);
    }

    var mainStyle = document.styleSheets[0];

    // size処理
    var sizeInput = document.getElementById("size");
    sizeInput.addEventListener("input", onInputSize, false);
    function onInputSize() {
        size = sizeInput.value / 2.0;
        mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:hover', "width: " + size + "px;");
        mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:hover', "height: " + size + "px;");
        mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:active', "width: " + size + "px;");
        mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:active', "height: " + size + "px;");
        size /= 2.0;
        mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:hover', "border-radius: " + size + "px;");
        mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:active', "border-radius: " + size + "px;");
    }


    //color処理
    var colorInput = document.getElementById("color");
    colorInput.addEventListener("input", onInputColor, false);
    function onInputColor() {
        color = colorInput.value;
        mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb', "background-color: " + color + ";");
    }

    // alpha処理
    var range = document.getElementById("alpha");
    var rangeValue = document.getElementById("alphavalue");
    range.addEventListener("input", onInputRange, false);
    function onInputRange() {
        alpha = range.value / 100.0;
        rangeValue.value = Math.floor(alpha * 10);
    }

    // chat処理
    var chatUserText = document.getElementById("username");
    var chatText = document.getElementById("chattext");
    document.getElementById("chatsend").addEventListener("click", sendChat, false);

    function sendChat() {
        var o = new Object();
        o.mode = "chat";
        var user = chatUserText.value;
        var text = chatText.value;
        if (text == undefined || text == "") return;
        o.text = (user == undefined || user == "" ? "匿名" : user) + "<br>" + text.replace("<", "&lt;").replace(">", "&gt;");
        webSocket.send(JSON.stringify(o));
        appendChat(o.text, true);
        chatText.value = "";
    }

    document.onkeydown = function (e) {
        if (typeof e.modifiers == 'undefined' ? e.ctrlKey : e.modifiers & Event.CONTROL_MASK) {
            if (e.which == 13) { //enter
                sendChat();
            }
        }
    }

    var chat_list = document.getElementById("chatcontentlist");

    function appendChat(text, self) {
        var ele = document.createElement("article");
        ele.id = self ? "mychatcontent" : "chatcontent";
        ele.innerHTML = lineWrap(text, 21);
        prependChild(chat_list, ele);
    }

    function lineWrap(text, maxlength) {
        var resultText = [""];
        var len = text.length;
        if (maxlength >= len) {
            return text;
        }
        else {
            var totalStrCount = parseInt(len / maxlength);
            if (len % maxlength != 0) {
                totalStrCount++
            }

            for (var i = 0; i < totalStrCount; i++) {
                if (i == totalStrCount - 1) {
                    resultText.push(text);
                }
                else {
                    var strPiece = text.substring(0, maxlength - 1);
                    resultText.push(strPiece);
                    resultText.push("<br>");
                    text = text.substring(maxlength - 1, text.length);
                }
            }
        }
        return resultText.join("");
    }

    function prependChild(parent, newFirstChild) {
        parent.insertBefore(newFirstChild, parent.firstChild)
    }

    // メニュー処理
    var menuIcon = document.getElementsByClassName("menuicon");
    for (i = 0; i < menuIcon.length; i++) {
        menuIcon[i].addEventListener("click", canvasMenu, false)
    }
    function canvasMenu() {
        var thisId = this.id;
        if (thisId.indexOf("color") + 1) {
            color = "#" + this.id.slice(5, this.id.length);
            colorInput.value = color;
        } else if (thisId.indexOf("clear") + 1) {
            if (confirm("すべて消去しますか？")) {
                var o = new Object();
                o.mode = "paint";
                o.size = "AllClear";
                webSocket.send(JSON.stringify(o));
                canvasClear();
            }
        } else if (thisId.indexOf("spoit") + 1) {
            if (fill) fill = false;
            spoit = true;
        } else if (thisId.indexOf("fill") + 1) {
            if (spoit) spoit = false;
            fill = true;
        }
    }

    // 塗りつぶし機能
    var floodfill = (function () {
        function f(p, v, u, l, t, g, B) {
            var k = p.length;
            var q = [];
            var o = (v + u * g) * 4;
            var r = o, z = o, s, A, n = g * 4;
            var h = [p[o], p[o + 1], p[o + 2], p[o + 3]];
            if (!a(o, h, l, p, k, t)) {
                return false
            }
            q.push(o);
            while (q.length) {
                o = q.pop();
                if (e(o, h, l, p, k, t)) {
                    r = o;
                    z = o;
                    A = parseInt(o / n) * n;
                    s = A + n;
                    while (A < z && A < (z -= 4) && e(z, h, l, p, k, t)) {
                    }
                    while (s > r && s > (r += 4) && e(r, h, l, p, k, t)) {
                    }
                    for (var m = z; m < r; m += 4) {
                        if (m - n >= 0 && a(m - n, h, l, p, k, t)) {
                            q.push(m - n)
                        }
                        if (m + n < k && a(m + n, h, l, p, k, t)) {
                            q.push(m + n)
                        }
                    }
                }
            }
            return p
        }

        function a(j, l, h, m, k, g) {
            if (j < 0 || j >= k) {
                return false
            }
            if (m[j + 3] === 0 && h.a > 0) {
                return true
            }
            if (Math.abs(l[3] - h.a) <= g && Math.abs(l[0] - h.r) <= g && Math.abs(l[1] - h.g) <= g && Math.abs(l[2] - h.b) <= g) {
                return false
            }
            if ((l[3] === m[j + 3]) && (l[0] === m[j]) && (l[1] === m[j + 1]) && (l[2] === m[j + 2])) {
                return true
            }
            if (Math.abs(l[3] - m[j + 3]) <= (255 - g) && Math.abs(l[0] - m[j]) <= g && Math.abs(l[1] - m[j + 1]) <= g && Math.abs(l[2] - m[j + 2]) <= g) {
                return true
            }
            return false
        }

        function e(j, l, h, m, k, g) {
            if (a(j, l, h, m, k, g)) {
                m[j] = h.r;
                m[j + 1] = h.g;
                m[j + 2] = h.b;
                m[j + 3] = h.a;
                return true
            }
            return false
        }

        function b(j, n, m, i, k, g, o) {
            if (!j instanceof Uint8ClampedArray) {
                throw new Error("data must be an instance of Uint8ClampedArray")
            }
            if (isNaN(g) || g < 1) {
                throw new Error("argument 'width' must be a positive integer")
            }
            if (isNaN(o) || o < 1) {
                throw new Error("argument 'height' must be a positive integer")
            }
            if (isNaN(n) || n < 0) {
                throw new Error("argument 'x' must be a positive integer")
            }
            if (isNaN(m) || m < 0) {
                throw new Error("argument 'y' must be a positive integer")
            }
            if (g * o * 4 !== j.length) {
                throw new Error("width and height do not fit Uint8ClampedArray dimensions")
            }
            var l = Math.floor(n);
            var h = Math.floor(m);
            if (l !== n) {
                console.warn("x truncated from", n, "to", l)
            }
            if (h !== m) {
                console.warn("y truncated from", m, "to", h)
            }
            k = (!isNaN(k)) ? Math.min(Math.abs(Math.round(k)), 254) : 0;
            return f(j, l, h, i, k, g, o)
        }

        var d = function (l) {
            var h = document.createElement("div");
            var g = {r: 0, g: 0, b: 0, a: 0};
            h.style.color = l;
            h.style.display = "none";
            document.body.appendChild(h);
            var i = window.getComputedStyle(h, null).color;
            document.body.removeChild(h);
            var k = /([\.\d]+)/g;
            var j = i.match(k);
            if (j && j.length > 2) {
                g.r = parseInt(j[0]) || 0;
                g.g = parseInt(j[1]) || 0;
                g.b = parseInt(j[2]) || 0;
                g.a = Math.round((parseFloat(j[3]) || 1) * 255)
            }
            return g
        };

        function c(p, n, m, i, o, q, g) {
            var s = this;
            var k = d(this.fillStyle);
            i = (isNaN(i)) ? 0 : i;
            o = (isNaN(o)) ? 0 : o;
            q = (!isNaN(q) && q) ? Math.min(Math.abs(q), s.canvas.width) : s.canvas.width;
            g = (!isNaN(g) && g) ? Math.min(Math.abs(g), s.canvas.height) : s.canvas.height;
            var j = s.getImageData(i, o, q, g);
            var l = j.data;
            var h = j.width;
            var r = j.height;
            if (h > 0 && r > 0) {
                b(l, p, n, k, m, h, r);
                s.putImageData(j, i, o)
            }
        }

        if (typeof CanvasRenderingContext2D === "function") {
            CanvasRenderingContext2D.prototype.fillFlood = c
        }
        return b
    })();
})();