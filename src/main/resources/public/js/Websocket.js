var keepAlive;
var mySessionId;
var webSocket;
var loadCache = "";

function webSocketInit(name) {
    new Promise(function () {
        var url = (("https:" == document.location.protocol) ? "wss://" : "ws://") +
            location.hostname + ":" + (location.port ? ":" + location.port : "") + "/web?name=" + name;
        webSocket = new WebSocket(url);

        webSocket.onopen = function () {
            keepAlive = setInterval(function () {
                webSocket.send("KeepAlive");
            }, 60000);
            $("#modeicon").css("background-color", "#00e676");
            $("#modetext").html("Server online");
        };

        webSocket.onclose = function () {
            clearInterval(keepAlive);
            appendChat("Application", "WebSocket connection closed.", "application", true);
            $("#modeicon").css("background-color", "#e74c3c");
            $("#modetext").html("Server offline");
        };

        webSocket.onmessage = function (event) {
            if (event.data == "KeepAlive") return;
            onMessageProcess(JSON.parse(event.data));
        };
    });
}

function onMessageProcess(json) {
    var count = $("#sessioncount");
    if (json.selfSessionId != undefined) mySessionId = json.selfSessionId;
    if (json.sessionCount == undefined) count.innerHTML = "接続人数: " + json.sessionCountLoad + "人";
    else {
        count.innerHTML = (json.sessionCount == -1) ? "接続できていません" :"接続人数: " + json.sessionCount + "人";
        switch (json.mode) {
            case "paint":
                if (json.size == "AllClear") {
                    clearCanvas();
                } else if (json.size == "DrawEnd") {
                    drawEnd(json.sessionId);
                } else {
                    draw(json.sessionId, json.size, json.color, json.alpha, json.x, json.y);
                }
                break;
            case "chat":
                appendChat(json.sessionName, json.text, json.sessionId, (json.sessionId == mySessionId), json.time);
                break;
            case "fill":
                selfContext.globalAlpha = json.alpha;
                selfContext.fillStyle = json.color;
                selfContext.fillFlood(json.x, json.y, 40);
                break;
            case "close":
                removeDraw(json.sessionId);
                break;
            case "special":
                selfContext.beginPath();
                selfContext.globalAlpha = json.alpha;
                selfContext.strokeStyle = json.color;
                selfContext.lineWidth = json.size;
                drawCover(selfContext, json.option, json.x1, json.y1, json.x2, json.y2);
                selfContext.stroke();
                break;
            case "canvas":
                if (json.option == "load") {
                    loadCache += json.text;
                    if (json.index == 3) {
                        var img = new Image();
                        img.onload = function () {
                            mainContext.drawImage(img, 0, 0);
                        };
                        img.src = loadCache;
                        loadCache = "";
                    }
                } else if (json.option == "send") {
                    json.option = "load";
                    var text = $("#mainCanvas").toDataURL();
                    var len = Math.ceil(text.length / 4);
                    for (var i = 0; i < 4; i++) {
                        json.text = text.substring(i * len, (i + 1) * len);
                        json.index = i;
                        send(json);
                    }
                }
                break;
        }
    }
}

function sendDraw(Mode, Size, Color, Alpha, X1, Y1, X2, Y2) {
    var json = {};
    json.size = Size;
    json.color = Color;
    json.alpha = Alpha;
    if (X2 == undefined || Y2 == undefined) {
        json.mode = Mode;
        json.x = X1;
        json.y = Y1;
    } else {
        json.mode = "special";
        json.option = Mode;
        json.x1 = X1;
        json.y1 = Y1;
        json.x2 = X2;
        json.y2 = Y2;
    }
    send(json);
}

function sendChat() {
    var chatText = $("#chattext");
    var text = chatText.val();
    var json = {};
    json.mode = "chat";
    if (!(text == undefined || text == "")) {
        json.text = text;
        json.time = getCurrentTime();
        send(json);
        chatText.val("");
    }
}

function send(object) {
    if (webSocket != undefined && webSocket.readyState == WebSocket.OPEN) {
        webSocket.send(JSON.stringify(object));
    } else {
        object.sessionCount = -1;
        object.sessionId = -1;
        object.sessionName = "NoConnection";
        onMessageProcess(object);
    }
}