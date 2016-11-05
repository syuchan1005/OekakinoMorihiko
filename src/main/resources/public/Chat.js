/**
 * Created by syuchan on 2016/10/14.
 */


var chatUserText = document.getElementById("username");
var chatText = document.getElementById("chattext");
document.getElementById("chatsend").addEventListener("click", sendChat, false);

var chat_list = document.getElementById("chatcontentlist");

function appendChat(text, sessionId, self) {
    var split = text.split("<br>");
    var ele = document.createElement("article");
    ele.id = self ? "mychatcontent" : "chatcontent";
    ele.innerHTML = "<span>" + split[0] + "</span>" +
                      "<span id='subChatContent'>" + "id:" + sessionId + "</span>" +
                      "<div>" + split[1] + "</div>";
    chat_list.insertBefore(ele, chat_list.firstChild);
}