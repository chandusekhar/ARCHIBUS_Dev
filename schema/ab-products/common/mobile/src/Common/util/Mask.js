/**
 * A simple class used to display and hide the Viewport mask.
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.Mask', {
    alternateClassName : [ 'Mask' ],
    singleton: true,

    /**
     * Adds and displays a loading mask to the Viewport.
     * @param {String} [displayText] Optional loading message
     */
    displayLoadingMask: function (displayText) {
        var loadingText = displayText ? displayText : '';

        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            message: loadingText,
            zIndex: 200
        });
    },

    /**
     * Hides the Viewport loading mask.
     */
    hideLoadingMask: function () {
        Ext.Viewport.setMasked(false);
    },

    /**
     * Updates the message of the displayed loading mask.
     * @param {String} message The message to be displayed in the loading mask spinner
     */
    setLoadingMessage: function(message) {
        var loadMask = Ext.ComponentQuery.query('viewport > loadmask');
        if(loadMask && loadMask.length > 0) {
            loadMask[0].setMessage(message);
        }
    }
});