(function () {
    var keepAlive;
    // var webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/web/");
    var webSocket = new WebSocket("ws://" + location.hostname + ":" + 4567 + "/web/");
    webSocket.onopen = function (event) {
        keepAlive = setInterval(function () {
            webSocket.send("Keep-Alive");
        }, 295000);
    };
    webSocket.onclose = function (event) {
        clearInterval(keepAlive);
        alert("WebSocket connection closed")
    };

    var count = document.getElementById("session_count");
    webSocket.onmessage = function (event) {
        var json = JSON.parse(event.data);
        if (json.session_count == undefined) {
            count.innerHTML = "接続人数" + json.session_count_load + "人";
        } else {
            count.innerHTML = "接続人数" + json.session_count + "人";
            if (json.size == "AllClear") canvasClear();
            draw(json.size, json.color, json.alpha, json.x, json.y);
        }
    };

    var canvas = document.getElementById("main_canvas");
    var ctx = canvas.getContext('2d');

    canvasClear();

    //初期値（サイズ、色、アルファ値、マウス）の決定
    var size = 7;
    var color = "#555555";
    var alpha = 1.0;
    var mouseX = "";
    var mouseY = "";

    canvas.addEventListener('mousemove', onMove, false);
    canvas.addEventListener('mousedown', onClick, false);
    canvas.addEventListener('mouseup', drawEnd, false);
    canvas.addEventListener('mouseout', drawEnd, false);

    function onMove(e) {
        if (e.buttons === 1 || e.witch === 1) {
            var rect = e.target.getBoundingClientRect();
            var X = ~~(e.clientX - rect.left);
            var Y = ~~(e.clientY - rect.top);
            sendDraw(size, color, alpha, X, Y);
            draw(size, color, alpha, X, Y);
        }
    };

    function onClick(e) {
        if (e.button === 0) {
            var rect = e.target.getBoundingClientRect();
            var X = ~~(e.clientX - rect.left);
            var Y = ~~(e.clientY - rect.top);
            draw(size, color, alpha, X, Y);
        }
    };

    function draw(Size, Color, Alpha, X, Y) {
        ctx.beginPath();
        ctx.globalAlpha = Alpha;
        //マウス継続値によって場合分け、直線の moveTo（スタート地点）を決定
        if (mouseX === "") {
            //継続値が初期値の場合は、現在のマウス位置をスタート位置とする
            ctx.moveTo(X, Y);
        } else {
            //継続値が初期値ではない場合は、前回のゴール位置を次のスタート位置とする
            ctx.moveTo(mouseX, mouseY);
        }
        //lineTo（ゴール地点）の決定、現在のマウス位置をゴール地点とする
        ctx.lineTo(X, Y);
        //直線の角を「丸」、サイズと色を決める
        ctx.lineCap = "round";
        ctx.lineWidth = Size * 2;
        ctx.strokeStyle = Color;
        ctx.stroke();
        // 現在のマウス位置を代入
        mouseX = X;
        mouseY = Y;
    };

    function drawEnd() {
        mouseX = "";
        mouseY = "";
    }

    function sendDraw(Size, Color, Alpha, X, Y) {
        var json = new Object();
        json.size = Size;
        json.color = Color;
        json.Alpha = alpha;
        json.x = X;
        json.y = Y;
        webSocket.send(JSON.stringify(json));
    }

    // キャンバスの初期化をする
    function canvasClear() {
        ctx.beginPath();
        ctx.fillStyle = "#f5f5f5";
        ctx.globalAlpha = 1.0;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // メニューの処理を追加
    var menuIcon = document.getElementsByClassName("menuicon");
    for (i = 0; i < menuIcon.length; i++) {
        menuIcon[i].addEventListener("click", canvasMenu, false)
    }

    // メニュー処理
    function canvasMenu() {
        var thisId = this.id;
        if (thisId.indexOf("size") + 1) {
            size = ~~this.id.slice(4, this.id.length);
        }
        if (thisId.indexOf("color") + 1) {
            color = "#" + this.id.slice(5, this.id.length);
        }
        if (thisId.indexOf("alpha") + 1) {
            alpha = (~~this.id.slice(5, this.id.length)) / 10;
        }
        if (thisId.indexOf("clear") + 1) {
            if (confirm("すべて消去しますか？")) {
                var o = new Object();
                o.size = "AllClear";
                webSocket.send(JSON.stringify(o));
                canvasClear();
            }
        }
    }
})();