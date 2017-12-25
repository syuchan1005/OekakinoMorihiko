$(function () {
    var $name = $('#jquery-ui-dialog-form-name');

    var $noWebSocketDialog = $("#no-websocket-dialog");
    var $loginDialog = $('#login-dialog');

    $noWebSocketDialog.dialog({
        autoOpen: false,
        width: 350,
        show: 'explode',
        hide: 'blind',
        modal: true,
        buttons: {
            'OK': function () {
                $noWebSocketDialog.dialog("close");
            },
            'Cancel': function () {
                $loginDialog.dialog("open");
                $noWebSocketDialog.dialog("close");
            },
        },
    });

    $loginDialog.dialog({
        autoOpen: true,
        width: 350,
        show: 'blind',
        hide: 'blind',
        modal: true,
        buttons: {
            'Connect': function () {
                if ($name.val()) $loginDialog.dialog('close');
            },
        },
        beforeClose: function (event, ui) {
            if ($name.val()) {
                webSocketInit($name.val());
            } else {
                $noWebSocketDialog.dialog("open");
            }
        },
    });
});