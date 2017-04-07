/**
 * Manages the device id information
 * @since 21.1
 * @author Jeff Martin
 * @singleton
 */
Ext.define('Common.util.Device', {

    alternateClassName: ['Device'],

    requires: [
        'Common.util.ConfigFileManager',
        'Common.util.Environment'
    ],

    singleton: true,

    /**
     * Returns the unique device id
     *
     */
    getDeviceId: function () {
        return ConfigFileManager.deviceId;
    },

    /* jshint -W016 */
    generateDeviceId: function () {
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });

    }
});