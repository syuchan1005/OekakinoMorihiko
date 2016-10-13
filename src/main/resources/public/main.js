(function () {
    var keepAlive;
    var webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/web/");
    webSocket.onopen = function (event) {
        keepAlive = setInterval(function () {
            webSocket.send("Keep-Alive");
        }, 299950);
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
            if (json.mode == "paint") {
                if (json.size == "AllClear") {
                    canvasClear();
                } else {
                    draw(json.size, json.color, json.alpha, json.x, json.y);
                }
            } else if (json.mode == "chat") {
                appendChat(json.text, false);
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

    canvas.addEventListener('mousemove', onMove, false);
    canvas.addEventListener('mousedown', onClick, false);

    function onMove(e) {
        if (e.buttons === 1 || e.witch === 1) {
            var rect = e.target.getBoundingClientRect();
            var X = ~~(e.clientX - rect.left);
            var Y = ~~(e.clientY - rect.top);
            sendDraw(size, color, alpha, X, Y);
            draw(size, color, alpha, X, Y);
        }
    }

    function onClick(e) {
        if (e.button === 0) {
            var rect = e.target.getBoundingClientRect();
            var X = ~~(e.clientX - rect.left);
            var Y = ~~(e.clientY - rect.top);
            sendDraw(size, color, alpha, X, Y);
            draw(size, color, alpha, X, Y);
        }
    }

    function draw(Size, Color, Alpha, X, Y) {
        ctx.beginPath();
        ctx.globalAlpha = Alpha;
        ctx.fillStyle = Color;
        ctx.arc(X, Y, Size, 0, Math.PI * 2, false);
        ctx.fill();
    }

    function sendDraw(Size, Color, Alpha, X, Y) {
        var json = new Object();
        json.mode = "paint";
        json.size = Size;
        json.color = Color;
        json.alpha = alpha;
        json.x = X;
        json.y = Y;
        webSocket.send(JSON.stringify(json));
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
        console.log(size);
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

    // キャンバスの初期化をする
    function canvasClear() {
        ctx.beginPath();
        ctx.fillStyle = "#f5f5f5";
        ctx.globalAlpha = 1.0;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
        }
        if (thisId.indexOf("clear") + 1) {
            if (confirm("すべて消去しますか？")) {
                var o = new Object();
                o.mode = "paint";
                o.size = "AllClear";
                webSocket.send(JSON.stringify(o));
                canvasClear();
            }
        }
    }
})();