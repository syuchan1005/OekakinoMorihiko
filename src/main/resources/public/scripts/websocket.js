/**
 * Created by syuchan on 2016/10/14.
 */
var keepAlive;
var mySessionId;
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
        if (json.sessionId != undefined) {
            mySessionId = json.sessionId;
        }
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
                appendChat(json.text, (json.sessionId == mySessionId));
                break;
            case "fill":
                ctx.globalAlpha = json.alpha;
                ctx.fillStyle = json.color;
                ctx.fillFlood(json.x, json.y, 40);
                break;
        }
    }
};

function sendDraw(Mode, Size, Color, Alpha, X, Y) {
    var json = new Object();
    json.mode = Mode;
    json.size = Size;
    json.color = Color;
    json.alpha = Alpha;
    json.x = X;
    json.y = Y;
    webSocket.send(JSON.stringify(json));
}

function sendChat() {
    var o = new Object();
    o.mode = "chat";
    var user = chatUserText.value;
    var text = chatText.value;
    if (text == undefined || text == "") return;
    o.text = (user == undefined || user == "" ? "匿名" : user) + "<br>" + text.replace("<", "&lt;").replace(">", "&gt;");
    webSocket.send(JSON.stringify(o));
    // appendChat(o.text, true);
    chatText.value = "";
}

