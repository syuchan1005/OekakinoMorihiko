var previewContext = $("#previewCanvas")[0].getContext("2d");

function canvasMenu() {
    noneCoverCanvas();
    if (this.classList.contains("selectable")) {
        toggleSelectable(this.id);
        if (this.classList.contains("special")) {
            showCoverCanvas();
        }
    } else if (this.id == "color-save") {
        addSample(getColor());
    } else if (this.id.indexOf("color") + 1) {
        setColor("#" + this.id.slice(5, this.id.length));
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
    picker.color = "#" + color;
    picker.style.backgroundColor = picker.color;
    drawPreviewCanvas();
});

var range = document.getElementById("alpha");
var sizeInput = document.getElementById("size");

range.addEventListener("input", drawPreviewCanvas, false);
sizeInput.addEventListener("input", drawPreviewCanvas, false);

function getColor() {
    return picker.color;
}

function setColor(hex) {
    colorPicker.set(hex);
    colorPicker.trigger("change", [hex.replace("#", "")]);
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

var colorSample = document.getElementById("color-sample");

function addSample(hex) {
    var colorButton = document.createElement("button");
    colorButton.innerHTML = hex;
    colorButton.value = hex;
    colorButton.style.backgroundColor = hex;
    colorButton.onclick = function (e) {
        setColor(this.innerHTML);
    };
    colorButton.oncontextmenu = function (e) {
        e.preventDefault();
        this.parentNode.removeChild(this);
    };
    colorSample.appendChild(colorButton);
}

document.getElementById("color-save").addEventListener("click", canvasMenu, false);

function appendChat(user ,text, sessionId, self, time) {
    time = time || "";
    var ele = document.createElement("article");
    ele.id = self ? "mychatcontent" : "chatcontent";
    ele.innerHTML = "<span>" + user.replace("<", "&lt;").replace(">", "&gt;") + "</span>" +
        "<span class='subChatContent'>" + "id:" + sessionId + "</span>" +
        "<span class='subChatContent'>" + time + "</span>" +
        "<div>" + text.replace("<", "&lt;").replace(">", "&gt;") + "</div>";
    var chatList = document.getElementById("chatcontentlist");
    chatList.insertBefore(ele, chatList.firstChild);
}

$(".menuicon").on("click", canvasMenu);

$("#chatsend").on("click", sendChat);
$("#downloadPng").on("click", openCanvasPng);

document.onkeydown = function (e) {
    if (e.ctrlKey) {
        if (e.which == 13) { //enter
            $("#chatsend").click();
        }
    } else if (e.keyCode == 27) {
        noneCoverCanvas();
        toggleSelectable(undefined);
    }
};
