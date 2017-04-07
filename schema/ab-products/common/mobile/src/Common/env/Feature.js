/**
 *
 * @author Jeff Martin
 * @since 22.1
 * @singleton
 */
Ext.define('Common.env.Feature', {
    singleton: true,

    /**
     * @property {Boolean} hasFileSystem Returns true when the device or browser supports the HTML5 FileSystem API
     */
    hasFileSystem: false,

    isNative: false,
    
    isHTCPhone: false,

    constructor: function() {
        this.setHasFileSystem();
        this.setIsNative();
        this.setIsHTCPhone();
    },

    /**
     * @private
     */
    setHasFileSystem: function() {
        // The Android Chrome Mobile browser includes file system support. We don't want to use the
        // file system on this platform so we set hasFileSystem to false.
        //<debug>
        if(Ext.os.is.Android && Ext.browser.is.ChromeMobile) {
            this.hasFileSystem = false;
            return;
        }
        //</debug>
        this.hasFileSystem = ('requestFileSystem' in window || 'webkitRequestFileSystem' in window);
    },

    setIsNative: function() {
        this.isNative = Ext.browser.is.PhoneGap ? true: false;
    },
    
    setIsHTCPhone: function() {
        var ua = navigator.userAgent;
        
        this.isHTCPhone = /HTC/.test(ua);
    }

});