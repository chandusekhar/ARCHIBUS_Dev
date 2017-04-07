/**
 * Functions used to start and end a Web Central mobile session. The mobile apps should have only one open session
 * at a time.
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Common.service.Session', {
    requires: [
        'Common.util.ConfigFileManager',
        'Common.controller.EventBus',
        'Ext.data.identifier.Uuid'
    ],

    singleton: true,

    /**
     * Logs a message when a Session is started or ended
     * @param {String} action The start or end action description. Values are Start and End
     * @returns {Promise} A Promise resolved with the message text
     */
    displaySessionIdMessage: function (action) {
        var message = Ext.String.format('{0} Session', action);
        return Promise.resolve(Log.log(message, 'info'));
    },

    /**
     * Starts a Web Central mobile sessioin
     * @returns {Promise} The Promise is resolved when the Web Central session is started. The Promise is rejected
     * if any errors occur when starting the session.
     */
    start: function () {
        return Common.service.Session.isClientRegistered()
            .then(function () {
                return Common.service.MobileSecurityServiceAdapter.startSession(ConfigFileManager.deviceId, ConfigFileManager.localeName);
            })
            .then(Common.service.Session.displaySessionIdMessage.bind(Common.service.Session, 'Start '));
    },

    /**
     * Ends a Web Central mobile session
     * * A warning message is logged if the session start and end calls are not consistent.
     * @returns {Promise} The returned Promise is always resolved. Calling Common.service.Session#end without an open
     * session does not cause an error.
     */
    end: function () {
        return Common.service.MobileSecurityServiceAdapter.endSession()
            .then(Common.service.Session.displaySessionIdMessage.bind(Common.service.Session, 'End '));
    },

    /**
     * Checks if the device client side registration flag is valid.
     * @private
     * @returns {Promise} A Promise object resolved to true if the device is registered, false otherwise.
     */
    isClientRegistered: function () {
        return new Promise(function (resolve, reject) {
            var notRegisteredMessage = LocaleManager.getLocalizedString('Device is not registered.', 'Common.service.Session');
            if (ConfigFileManager.isDeviceRegistered) {
                resolve();
            } else {
                Common.controller.EventBus.fireDeviceNotRegistered();
                reject(notRegisteredMessage);
            }
        });
    }


});
