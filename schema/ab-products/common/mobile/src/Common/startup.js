// This file contains JavaScript code that should be executed on start-up, before any other JavaScript code.
// Code belongs here if it has global scope.


// Set global error handler
window.onerror = function (message, url, line) {
    var fireExceptionMessageEvent = function () {
            if (typeof Common.util.SynchronizationManager !== 'undefined') {
                Common.util.SynchronizationManager.fireEvent('exception');
            }
            if ((typeof Space !== 'undefined') && (typeof Space.SpaceDownload !== 'undefined')) {
                Space.SpaceDownload.fireEvent('exception');
            }
        },
        logMessage;

    if (url && line) {
        console.log('[ERROR] URL: ' + url + ' Line: ' + line);
    }

    // strip 'Uncaught' prefix
    message = message.replace('Uncaught', '');
    message = message.replace('Error:', '');

    // Eat exceptions that are intermittently thrown by the framework
    // These exceptions can be enabled during development to catch actual implementation errors.
    // Eat exceptions with the text "Type 'null' is not an object"
    if (message.indexOf("Type 'null' is not an object") !== -1) {
        return;
    }
    // Eat exceptions with the text "Type 'undefined' is not an object"
    if (message.indexOf("Type 'undefined' is not an object") !== -1) {
        return;
    }

    // Eat Windows Phone error
    if (message.indexOf('Unable to get property') !== -1) {
        return;
    }

    if (Ext.MessageBox && Ext.Msg) {
        Ext.Msg.alert('', message);
    } else {
        alert(message);
    }

    if (Common.log.Logger) {
        if (url && line) {
            logMessage = url + ' Line: ' + line + ' ' + message;
        } else {
            logMessage = message;
        }
        Common.log.Logger.log(logMessage, 'error');
    }

    fireExceptionMessageEvent();
    if (Ext.Viewport) {
        Ext.Viewport.setMasked(false);
    }


};
