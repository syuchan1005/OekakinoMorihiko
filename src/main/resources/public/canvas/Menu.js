var menuIcon = document.getElementsByClassName("menuicon");

for (var i = 0; i < menuIcon.length; i++) {
    if (menuIcon[i].innerHTML.length != 0) menuIcon[i].style.width = 1.66 * menuIcon[i].innerHTML.length + "em";
    menuIcon[i].addEventListener("click", canvasMenu, false)
}
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
        list[i].style.border = "1px solid #dddddd";
    }
    if (id != undefined) document.getElementById(id).style.border = "1px solid #00BFFF";
    selectId = id;
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
    mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:hover', "border-radius: " + size / 2.0 + "px;");
    mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb:active', "border-radius: " + size / 2.0 + "px;");
}
onInputSize();

//color処理
var colorInput = document.getElementById("color");
colorInput.addEventListener("input", onInputColor, false);
function onInputColor() {
    color = colorInput.value;
    mainStyle.addRule('input[type="range"]#size::-webkit-slider-thumb', "background-color: " + color + ";");
}
onInputColor();

// alpha処理
var range = document.getElementById("alpha");
var rangeValue = document.getElementById("alphavalue");
range.addEventListener("input", onInputRange, false);
function onInputRange() {
    alpha = range.value / 100.0;
    rangeValue.value = range.value / 10.0;
}
onInputRange();