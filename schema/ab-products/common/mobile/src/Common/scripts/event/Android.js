/**
 * Adds Android events
 *
 * @since 21.2
 * @author Jeff Martin
 */
Ext.define('Common.scripts.event.Android', {
    alternateClassName: 'AndroidEvent',
    mixins: ['Ext.mixin.Observable'],
    singleton: true,

    constructor: function() {
        // Only register the events if we are running on an Android platform.
        if(Ext.os.is.Android) {
            this.registerAndroidEvents();
        }
    },

    /**
     * Registers the showkeyboard and hidekeyboard events
     * @private
     */
    registerAndroidEvents: function() {
        var me = this;

        document.addEventListener("showkeyboard", function() {
            me.fireEvent('showkeyboard');
        }, false);
        document.addEventListener("hidekeyboard", function() {
            me.fireEvent('hidekeyboard');
        }, false);

    }

});