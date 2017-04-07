/**
 * Provides the device geolocation functions.
 *
 * @since 23.1
 * @author Jeff Martin
 */
Ext.define('Common.device.Location', {
    singleton: true,

    requires: 'Common.log.Logger',

    mixins: ['Ext.mixin.Observable'],

    /**
     * @property {Number} maximumAge Accept a cached position whose age is no greater than the specified time in milliseconds.
     */
    maximumAge: 3000,

    /**
     * @property {Number} timeout The maximum length of time (milliseconds) that is allowed to pass from the call to getCurrentPosition
     * or watchPosition until thecorresponding geolocationSuccess callback executes. If the geolocationSuccess callback is not
     * invoked within this time, the geolocationError callback is passed a PositionError.TIMEOUT error code.
     */
    timeout: 15000,

    /**
     * @property {Boolean} enableHighAccuracy Provides a hint that the application needs the best possible results.
     * By default, the device attempts to retrieve a Position using network-based methods. Setting this property to
     * true tells the framework to use more accurate methods, such as satellite positioning.
     */
    enableHighAccuracy: true,

    /**
     * @property {Number} watchId The watchId of an active watch session. This value is null when the device is not actively
     * watching the position.
     */
    watchId: null,

    /**
     * @event positionchange Fired when the device is watching for position changes and a position change is detected.
     */


    /**
     * Decodes the Position error message
     * @param error
     * @returns {*|String}
     */
    errorMessage: function (error) {
        var message = LocaleManager.getLocalizedString('Unknown Postion Error', 'Common.device.Location');

        switch (error.code) {
            case 1:
                message = LocaleManager.getLocalizedString('Permission to Access Location Information Denied', 'Common.device.Location');
                break;
            case 2:
                message = LocaleManager.getLocalizedString('Position is not available', 'Common.device.Location');
                break;
            case 3:
                message = LocaleManager.getLocalizedString('Position Timeout', 'Common.device.Location');
                break;
        }

        return message;
    },


    /**
     * Returns the device current position in the resolved Promise. The Promise is resolved with a Position object.
     * The Position object contains the coordinates (coords property), and the creation timestamp (timestamp property)
     * The coords object contains the following properties
     *    latitude Latitude in decimal degrees
     *    longitude Longitued in decimal degrees
     *    altitude Height of the position in meters
     *    accuracy Accuracy level of the latitude and longitude in meters
     *    altitudeAccuracy Accuracy level of the altitude coordinates in meters
     *    heading Direction of travel, specified in degrees counting clockwise relative to true north
     *    speed Current ground speed of the device specified in meters per second
     * @returns {Promise} A Promise resolved with the Position object or rejected with the error message.
     */
    getCurrentPosition: function () {
        var me = this,
            options = me.getOptions();

        return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, function (error) {
                // Decode error
                reject(me.errorMessage(error));
            }, options);
        });
    },

    /**
     * Starts watching the device position. Fires the positionchange event when a change in the device position is detected.
     */
    watchPosition: function () {
        var me = this,
            options = me.getOptions(),
            watchId;

        watchId = navigator.geolocation.watchPosition(function (position) {
            me.watchId = watchId;
            me.onPositionChange(position);
        }, function (error) {
            var errorMessage = me.errorMessage(error);
            Log.log(errorMessage, 'error');
        }, options);
    },

    /**
     * Stops watching the device position.
     */
    clearWatch: function () {
        var watchId = Common.device.Location.watchId;
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            Common.device.Location.watchId = null;
        }
    },

    /**
     * Provides the options object used to customize the location retrieval
     * @private
     * @returns {Object} The options object
     */
    getOptions: function () {
        var me = this,
            options = {};

        options.maximumAge = me.maximumAge;
        options.timeout = me.timeout;
        options.enableHighAccuracy = me.enableHighAccuracy;

        return options;
    },

    /**
     * Fires the position change event
     * @private
     * @param position
     */
    onPositionChange: function (position) {
        var me = this;
        me.fireEvent('positionchange', position, me);
    }
});