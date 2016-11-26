/**
 * Created by syuchan on 2016/10/14.
 */
var keepAlive;
var mySessionId;
var webSocket;

var modeIcon = document.getElementById("modeicon");
var modeText = document.getElementById("modetext");

function webSocketInit() {
    new Promise(function () {
        var url = (("https:" == document.location.protocol) ? "wss://" : "ws://") + location.hostname + ":" + (location.port || 80) + "/web/";
        webSocket = new WebSocket(url);
        webSocket.binaryType = "arraybuffer";

        webSocket.onopen = function () {
            keepAlive = setInterval(function () {
                webSocket.send("KeepAlive");
            }, 150000);
            modeIcon.style.backgroundColor = "#00e676";
            modeText.innerHTML = "Server online";
        };

        webSocket.onclose = function () {
            clearInterval(keepAlive);
            appendChat("Application<br>WebSocket connection closed.", "application", true);
            count.innerHTML = "サーバーに接続できません";
            modeIcon.style.backgroundColor = "#e74c3c";
            modeText.innerHTML = "Server offline";
        };

        webSocket.onmessage = function (event) {
            if (event.data == "KeepAlive") return;
            onMessageProcess(JSON.parse(event.data));
        };
    });
}

function webSocketReload() {
    if (webSocket.readyState == WebSocket.OPEN) {
        appendChat("Application<br>WebSocket already opened!", "application", true)
    } else {
        webSocketInit();
    }
}

var count = document.getElementById("sessioncount");
var loadCache = "";

function onMessageProcess(json) {
    if (json.selfSessionId != undefined) {
        mySessionId = json.selfSessionId;
    }
    if (json.sessionCount == undefined) {
        count.innerHTML = "接続人数: " + json.sessionCountLoad + "人";
    } else {
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
                appendChat(json.text, json.sessionId, (json.sessionId == mySessionId));
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
                switch (json.option) {
                    case "load":
                        loadCache += json.text;
                        if (json.index == 3) {
                            var img = new Image();
                            img.onload = function () {
                                selfContext.drawImage(img, 0, 0);
                            };
                            img.src = loadCache;
                            loadCache = undefined;
                        }
                        break;
                    case "send":
                        json.option = "load";
                        var text = selfCanvas.toDataURL();
                        var len = Math.ceil(text.length / 4);
                        for (var i = 0; i < 4; i++) {
                            json.text = text.substring(i * len, (i + 1) * len);
                            json.index = i;
                            send(json);
                        }
                        break;
                }
                break;
        }
    }
}

function sendDraw(Mode, Size, Color, Alpha, X, Y) {
    var json = {};
    json.mode = Mode;
    json.size = Size;
    json.color = Color;
    json.alpha = Alpha;
    json.x = X;
    json.y = Y;
    send(json);
}

function sendSpecialDraw(Mode, Size, Color, Alpha, X1, Y1, X2, Y2) {
    var json = {};
    json.mode = "special";
    json.option = Mode;
    json.size = Size;
    json.color = Color;
    json.alpha = Alpha;
    json.x1 = X1;
    json.y1 = Y1;
    json.x2 = X2;
    json.y2 = Y2;
    send(json);
}

function sendChat() {
    var json = {};
    json.mode = "chat";
    var user = chatUserText.value;
    var text = chatText.value;
    if (text == undefined || text == "") return;
    json.text = (user == undefined || user == "" ? "匿名" : user) + "<br>" + text;
    send(json);
    chatText.value = "";
}

function send(object) {
    if (webSocket != undefined && webSocket.readyState == WebSocket.OPEN) {
        webSocket.send(JSON.stringify(object));
    } else {
        object.sessionCount = -1;
        object.sessionId = -1;
        onMessageProcess(object);
    }
}

webSocketInit();