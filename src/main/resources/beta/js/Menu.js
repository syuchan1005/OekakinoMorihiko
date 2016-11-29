var menuIcon = document.getElementsByClassName("menuicon");
var chatUserText = document.getElementById("username");
var chatText = document.getElementById("chattext");
var chat_list = document.getElementById("chatcontentlist");
var previewCanvas = document.getElementById("previewCanvas");
var previewContext = previewCanvas.getContext("2d");

function canvasMenu() {
    noneCoverCanvas();
    if (this.classList.contains("selectable")) {
        toggleSelectable(this.id);
        if (this.classList.contains("special")) {
            showCoverCanvas();
        }
    } else if (this.id.indexOf("color") + 1) {
        colorPicker.setHex("#" + this.id.slice(5, this.id.length));
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

var colorInput = document.getElementById("color-input");
var picker = document.getElementById('color-picker');
var colorPicker = new CP(picker, false);
colorPicker.picker.classList.add('static');
colorPicker.set("#555555");
colorPicker.enter(colorInput);
colorPicker.on("change", function (color) {
    picker.style.backgroundColor = "#" + color;
    drawPreviewCanvas();
});

var range = document.getElementById("alpha");
var sizeInput = document.getElementById("size");

range.addEventListener("input", drawPreviewCanvas, false);
sizeInput.addEventListener("input", drawPreviewCanvas, false);

function getColor() {
    return picker.style.backgroundColor;
}

function getAlpha() {
    return range.value / 100.0;
}

function getSize() {
    return sizeInput.value / 2.0;
}

function drawPreviewCanvas() {
    previewContext.clearRect(0, 0, 150, 150);
    previewContext.beginPath();
    previewContext.globalAlpha = getAlpha();
    previewContext.strokeStyle = getColor();
    previewContext.lineWidth = getSize() * 1.5;
    previewContext.lineCap = 'round';
    previewContext.moveTo(75, 75);
    previewContext.lineTo(75, 75);
    previewContext.stroke();
}

function appendChat(text, sessionId, self, time) {
    time = time || "";
    var split = text.split("<br>");
    var ele = document.createElement("article");
    ele.id = self ? "mychatcontent" : "chatcontent";
    ele.innerHTML = "<span>" + split[0].replace("<", "&lt;").replace(">", "&gt;") + "</span>" +
        "<span class='subChatContent'>" + "id:" + sessionId + "</span>" +
        "<span class='subChatContent'>" + time + "</span>" +
        "<div>" + split[1].replace("<", "&lt;").replace(">", "&gt;") + "</div>";
    chat_list.insertBefore(ele, chat_list.firstChild);
}

for (var i = 0; i < menuIcon.length; i++) {
    menuIcon[i].addEventListener("click", canvasMenu, false)
}
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