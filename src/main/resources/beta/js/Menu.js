var menuIcon = document.getElementsByClassName("menuicon");
var chatUserText = document.getElementById("username");
var chatText = document.getElementById("chattext");
var chat_list = document.getElementById("chatcontentlist");

function canvasMenu() {
    noneCoverCanvas();
    if (this.classList.contains("selectable")) {
        toggleSelectable(this.id);
        if (this.classList.contains("special")) {
            showCoverCanvas();
        }
    } else if (this.id.indexOf("color") + 1) {
        colorInput.value = "#" + this.id.slice(5, this.id.length);
        onInputColor();
    } else if (this.id.indexOf("clear") + 1) {
        if (confirm("すべて消去しますか？")) {
            sendDraw("paint", "AllClear");
        }
    }
}

function toggleSelectable(id) {
    var list = document.getElementsByClassName("selectable");
    for (var i = 0; i < list.length; i++) {
        list[i].style.color = "#272727";
    }
    if (id != undefined) document.getElementById(id).style.color = "#3399FF";
    selectId = id;
}

var sizeInput = document.getElementById("size");
sizeInput.addEventListener("input", onInputSize, false);
function onInputSize() {
    size = sizeInput.value / 2.0;
}

var colorInput = document.getElementById("color");
colorInput.addEventListener("input", onInputColor, false);
function onInputColor() {
    color = colorInput.value;
}

var range = document.getElementById("alpha");
var rangeValue = document.getElementById("alphavalue");
range.addEventListener("input", onInputRange, false);
function onInputRange() {
    alpha = range.value / 100.0;
    rangeValue.value = range.value / 10.0;
}

function appendChat(text, sessionId, self) {
    var split = text.split("<br>");
    var ele = document.createElement("article");
    ele.id = self ? "mychatcontent" : "chatcontent";
    ele.innerHTML = "<span>" + split[0].replace("<", "&lt;").replace(">", "&gt;") + "</span>" +
        "<span id='subChatContent'>" + "id:" + sessionId + "</span>" +
        "<div>" + split[1].replace("<", "&lt;").replace(">", "&gt;") + "</div>";
    chat_list.insertBefore(ele, chat_list.firstChild);
}

for (var i = 0; i < menuIcon.length; i++) {
    menuIcon[i].addEventListener("click", canvasMenu, false)
}

onInputSize();
onInputColor();
onInputRange();

document.getElementById("chatsend").addEventListener("click", sendChat, false);
document.getElementById("downloadPng").addEventListener("click", openCanvasPng, false);

document.onkeydown = function (e) {
    if (e.ctrlKey) {
        if (e.which == 13) { //enter
            sendChat();
        }
    } else if (e.keyCode == 27) {
        noneCoverCanvas();
        toggleSelectable(undefined);
    }
};