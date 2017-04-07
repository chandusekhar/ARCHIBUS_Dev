/**
 * Checks if the Web Central server is available
 */
Ext.define('Common.util.Network', {
    alternateClassName: ['Network'],
    singleton: true,

    requires: 'Common.util.Mask',

    /**
     * Framework level timeout value for asynchronous service calls.
     * The units for SERVICE_TIMEOUT are seconds
     * @property {Number} SERVICE_TIMEOUT
     */
    SERVICE_TIMEOUT: 500,

    NETWORK_CONNECTION_UNAVAILABLE: LocaleManager.getLocalizedString('Network connection is not available', 'Common.util.Network'),
    NETWORK_UNREACHABLE: LocaleManager.getLocalizedString('Network Unreachable', 'Common.util.Network'),

    /**
     * Checks if the Web Central server is reachable.
     *
     * @param {String} url - optional - The url to check for connectivity.
     * @return {Boolean} True if the connection to the server succeeds.
     */
    isServerReachable: function (url) {
        var xhr = new XMLHttpRequest(),
            status,
            urlToCheck;

        if (Ext.isEmpty(url)) {
            urlToCheck = this.getCurrentUrl();
        } else {
            urlToCheck = url;
        }

        xhr.open("HEAD", urlToCheck + "?rand=" + Math.random(), false);
        try {
            xhr.send();
            status = xhr.status;
            // Make sure the server is reachable
            return (status >= 200 && status < 300 || status === 304);
            // catch network & other problems
        } catch (e) {
            return false;
        }
    },

    isServerReachableAsync: function (url, onCompleted, scope) {
        var xhr = new XMLHttpRequest(),
            xhrComplete = function (result) {
                Ext.callback(onCompleted, scope, [result]);
            },
            requestTimer;

        if (Ext.isEmpty(url)) {
            url = this.getCurrentUrl();
        }
        url = url + ((url.indexOf('?') === -1) ? '?' : '&') + Date.now();

        try {
            xhr.open('HEAD', url, true);
            requestTimer = setTimeout(function () {
                xhr.abort();
            }, 10000);
            xhr.onreadystatechange = function () {
                var status,
                    content;
                if (xhr.readyState === 4) {
                    clearTimeout(requestTimer);
                    status = xhr.status;
                    content = xhr.responseText;

                    if ((status >= 200 && status < 300) || status === 304 || (status === 0 && content.length > 0)) {
                        xhrComplete(true);
                    }
                    else {
                        xhrComplete(false);
                    }
                }
            };
            xhr.send(null);
        } catch (e) {
            xhrComplete(false);
        }
    },

    /**
     * Queries the device for the status of the network connection
     *
     * @return {Boolean} True if the device detects a network connection.
     */
    isDeviceConnected: function () {
        var networkState;

        // Always return true if we running on the Desktop
        // TODO: Windows Phone emulator always returns Connnection.UNKNOWN...
        // Create plugin to check if we are running in an emulator
        if (Ext.os.is.Desktop || Ext.os.is.WindowsPhone) {
            return true;
        }

        networkState = Connection.NONE;

        if (navigator.network.connection) {
            networkState = navigator.network.connection.type;
        }
        return networkState !== Connection.UNKNOWN && networkState !== Connection.NONE;
    },

    isDeviceAndServerConnected: function (url) {
        var isDeviceConnected = this.isDeviceConnected();

        // If the device connection is not available return false without checking the
        // server connection
        if (!isDeviceConnected) {
            return false;
        } else {
            return this.isServerReachable(url);
        }
    },

    isDeviceAndServerConnectedAsync: function (url, onCompleted, scope) {
        var me = this,
            isDeviceConnected = me.isDeviceConnected();
        // If the device connection is not available return false without checking the
        // server connection
        if (!isDeviceConnected) {
            Ext.callback(onCompleted, scope, [false]);
        } else {
            me.isServerReachableAsync(url, function (result) {
                Ext.callback(onCompleted, scope, [result]);
            }, me);
        }
    },

    /**
     * Checks if the device has an active network connection and if the Web Central server is online.
     * @param {Function} onCompleted Called when the check is complete
     * @param {Object} scope The scope to execute the onCompleted function
     */
    checkNetworkConnectionAndDisplayMessageAsync: function (onCompleted, scope) {
        var me = this;
        Mask.displayLoadingMask();
        Network.isDeviceAndServerConnectedAsync(null, function (result) {
            Mask.hideLoadingMask();
            if (result) {
                Ext.callback(onCompleted, scope || me, [result]);
            } else {
                Ext.Msg.show({
                    title: LocaleManager.getLocalizedString('Network Unreachable', 'Common.util.Network'),
                    message: LocaleManager.getLocalizedString('Network connection is not available', 'Common.util.Network')
                });
                Ext.callback(onCompleted, scope || me, [result]);
            }
        }, me);
    },

    /**
     * Returns the URL of the current page. Removes the has value if it exists
     */
    getCurrentUrl: function () {
        var hash = window.location.hash,
            url = window.location.href;

        if (url.indexOf(hash) !== -1) {
            url = url.replace(hash, '');
        }

        return url;
    },

    checkNetworkConnectionAndDisplayMessage: function() {
        var me = this;
        return new Promise(function(resolve) {
            Network.isDeviceAndServerConnectedAsync(null,function(result) {
                if(result) {
                    resolve(result);
                } else {
                    me.displayConnectionMessage();
                    resolve(result);
                }
            });
        });
    },

    checkNetworkConnectionAndLoadDwrScripts: function(displayErrorMessage) {
        var me = this;
        return new Promise(function(resolve, reject) {
            Network.isDeviceAndServerConnectedAsync(null,function(result) {
                if(result) {
                    Common.scripts.ScriptManager.loadDwrScripts()
                        .then(function() {
                            resolve(true);
                        }, reject);
                } else {
                    if(displayErrorMessage) {
                        me.displayConnectionMessage();
                    }
                    resolve(false);
                }
            });
        });
    },

    /**
     * Displays the 'Network Connection Unavailable' message
     */
    displayConnectionMessage: function() {
        Ext.Msg.alert(Common.util.Network.NETWORK_UNREACHABLE, Common.util.Network.NETWORK_CONNECTION_UNAVAILABLE);
    }
});