/**
 * Created by syuchan on 2016/10/14.
 */
var keepAlive;
var mySessionId;
var webSocket = new WebSocket("wss://" + location.hostname + ":" + location.port + "/web/");

var modeIcon = document.getElementById("modeicon");
var modeText = document.getElementById("modetext");

webSocket.onopen = function (event) {
    keepAlive = setInterval(function () {
        console.log("keepAlive");
        webSocket.send("KeepAlive");
    }, 150000);
    modeIcon.style.backgroundColor = "#00e676";
    modeText.innerHTML = "Server online";
};

webSocket.onclose = function (event) {
    clearInterval(keepAlive);
    appendChat("Application<br>WebSocket connection closed.", "application", true);
    count.innerHTML = "サーバーに接続できません";
    modeIcon.style.backgroundColor = "#e74c3c";
    modeText.innerHTML = "Server offline";
};

webSocket.onmessage = function (event) {
    if (event.date == "KeepAlive") return;
    onMessageProcess(JSON.parse(event.data));
};

var count = document.getElementById("sessioncount");

function onMessageProcess(json) {
    if (json.selfSessionId != undefined) {
        mySessionId = json.selfSessionId;
    }
    if (json.sessionCount == undefined) {
        count.innerHTML = "接続人数: " + json.sessionCountLoad + "人";
    } else {
        count.innerHTML = "接続人数: " + json.sessionCount + "人";
        switch (json.mode) {
            case "paint":
                if (json.size == "AllClear") {
                    clearCanvas();
                } else if (json.size == "DrawEnd"){
                    drawEnd(json.sessionId);
                } else {
                    draw(json.sessionId, json.size, json.color, json.alpha, json.x, json.y);
                }
                break;
            case "chat":
                appendChat(json.text, json.sessionId, (json.sessionId == mySessionId));
                break;
            case "fill":
                ctx.globalAlpha = json.alpha;
                ctx.fillStyle = json.color;
                ctx.fillFlood(json.x, json.y, 40);
                break;
            case "close":
                removeDraw(json.sessionId);
                break;
            case "special":
                var w = (json.x1 - json.x2) * -1;
                var h = (json.y1 - json.y2) * -1;
                ctx.beginPath();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = color;
                ctx.lineWidth = size;
                switch (json.option) {
                    case "square":
                        ctx.strokeRect(json.x1, json.y1, w, h);
                        break;
                    case "circle":
                        ellipse(ctx, json.x1 + w / 2.0, json.y1 + h / 2.0, w, h);
                        break;
                }
                ctx.stroke();
                break;
        }
    }
}

function sendDraw(Mode, Size, Color, Alpha, X, Y) {
    var json = new Object();
    json.mode = Mode;
    json.size = Size;
    json.color = Color;
    json.alpha = Alpha;
    json.x = X;
    json.y = Y;
    send(json);
}

function sendSpecialDraw(Mode, Size, Color, Alpha, X1, Y1, X2, Y2) {
    var json = new Object();
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
    var json = new Object();
    json.mode = "chat";
    var user = chatUserText.value;
    var text = chatText.value;
    if (text == undefined || text == "") return;
    json.text = (user == undefined || user == "" ? "匿名" : user) + "<br>" + text.replace("<", "&lt;").replace(">", "&gt;");
    send(json);
    chatText.value = "";
}

function send(object) {
    if (webSocket != undefined && webSocket.readyState != 3) {
        webSocket.send(JSON.stringify(object));
    } else {
        object.sessionCount = 1;
        object.sessionId = 1;
        onMessageProcess(object);
    }
}

