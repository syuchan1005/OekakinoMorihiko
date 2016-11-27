var menuIcon = document.getElementsByClassName("menuicon");

for (var i = 0; i < menuIcon.length; i++) {
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
        onInputColor("#" + this.id.slice(5, this.id.length));
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

// size処理
$('#size').on('input change', function () {
    size = $(this).val();
});

//color処理
var colorpickerHolder = $('#colorpickerHolder');
colorpickerHolder.ColorPicker({
    flat: true,
    color: color,
    onChange: function (hsb, hex, rgb) {
        color = '#' + hex;
    }
});

function onInputColor(rgb) {
    colorpickerHolder.ColorPickerSetColor(rgb);
    color = rgb;
}

// alpha処理
var range = $("#alpha");

range.on('input change', function () {
    alpha = range.val() / 100.0;
    $("#alphavalue").val(range.val() / 10.0);
});
