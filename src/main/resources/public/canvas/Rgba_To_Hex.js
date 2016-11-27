function rgbaToHex(fg_color, bg_color) {
    // HEXに変換したものを代入する変数
    var hex = '#';

    // 第1引数がHEXのとき変換処理は必要ないのでそのままreturn
    // IE8の場合はjQueryのcss()関数でHEXを返すので除外
    if (fg_color.match(/^#[a-f\d]{3}$|^#[a-f\d]{6}$/i)) {
        return fg_color;
    }

    // 第1引数の正規表現
    var regex = fg_color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*?(?:\.?\d+))?\)$/);

    // 正規表現でマッチしたとき
    if (regex) {
        // 前景色のRGB成分
        var rgb = [
                parseInt(regex[1]),
                parseInt(regex[2]),
                parseInt(regex[3])
            ];
        // 透明度
        var alpha = parseFloat(regex[4]);
        // 背景色のRGB成分(第2引数が省略されたときのデフォルト値)
        var rgb_bg = [255, 255, 255];

        // 第2引数があるとき
        if (arguments.length == 2) {
            // 第2引数の正規表現
            var regex_rgb = bg_color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            var regex_hex = bg_color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$|^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i);

            // 第2引数がRGBのとき
            if (regex_rgb) {
                // 背景色のRGB成分を書き換える
                for (var i = 0; i < rgb_bg.length; ++i) {
                    rgb_bg[i] = parseInt(regex_rgb[i + 1]);
                }
            }
            // 第2引数がHEXのとき
            else if (regex_hex) {
                // #fff形式のとき
                if (typeof regex_hex[1] == 'undefined') {
                    // HEXからRGBに変換して背景色のRGB成分に代入
                    for (var i = 0; i < rgb_bg.length; ++i) {
                        rgb_bg[i] = parseInt(regex_hex[i + 4] + regex_hex[i + 4], 16);
                    }
                }
                // #ffffff形式のとき
                else if (typeof regex_hex[4] == 'undefined') {
                    // HEXからRGBに変換して背景色のRGB成分に代入
                    for (var i = 0; i < rgb_bg.length; ++i) {
                        rgb_bg[i] = parseInt(regex_hex[i + 1], 16);
                    }
                }
            } else {
                console.error('第2引数はHEXまたはRGB形式で入力');
                return;
            }
        }

        for (var i = 0; i < rgb_bg.length; ++i) {
            // 背景色を考慮した透明度による計算
            var tmp = Math.floor((1 - alpha) * rgb_bg[i] + alpha * rgb[i]);

            // rgb値は0から255の範囲なので超えた場合は255にする
            if (tmp > 255) {
                tmp = 255;
            }
            // HEXに変換
            tmp = tmp.toString(16);

            // rgb(1,1,1)のようなときHEXに変換すると1桁になる
            // 1桁のときは前に0を足す
            if (tmp.length == 1) {
                tmp = '0' + tmp;
            }
            hex += tmp;
        }

        return hex;
    }

    console.error('第1引数はRGBA形式で入力');
}
