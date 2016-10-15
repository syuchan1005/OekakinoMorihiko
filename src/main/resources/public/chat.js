/**
 * Created by syuchan on 2016/10/14.
 */


var chatUserText = document.getElementById("username");
var chatText = document.getElementById("chattext");
document.getElementById("chatsend").addEventListener("click", sendChat, false);

document.onkeydown = function (e) {
    if (typeof e.modifiers == 'undefined' ? e.ctrlKey : e.modifiers & Event.CONTROL_MASK) {
        if (e.which == 13) { //enter
            sendChat();
        }
    }
}

var chat_list = document.getElementById("chatcontentlist");

function appendChat(text, sessionId, self) {
    var split = text.split("<br>");
    var ele = document.createElement("article");
    ele.id = self ? "mychatcontent" : "chatcontent";
    ele.innerHTML = "<span>" + split[0] + "</span>" +
        "<span id='subChatContent'>" + "id:" + sessionId + "</span>" +
        "<div>" + lineWrap(split[1], 21) + "</div>";
    chat_list.insertBefore(ele, chat_list.firstChild);
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
