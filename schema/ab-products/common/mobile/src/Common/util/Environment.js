/**
 * Provides information about the environment the app is running in.
 * @since 21.1
 */
Ext.define('Common.util.Environment', {

	alternateClassName : [ 'Environment' ],

	singleton : true,

    // TODO: Rename isBrowserMode
	/**
	 * Detects the browser that the app is running in. Used to allow the app to run on browsers other than the Chrome
	 * and WebView browsers.
	 * 
	 * @returns {boolean} False if the app is running on a device or in the Chrome browser True otherwise.
	 */
	getBrowserMode : function() {
        var developerMode;

        if (typeof Abm !== 'undefined') {
            developerMode = Abm.DEV_MODE;
        } else {
            developerMode = false;
        }
		if (Ext.browser.is.PhoneGap || (Ext.browser.is.Chrome && developerMode)) {
			console.log(LocaleManager.getLocalizedString('Running in Chrome or in WebView. Filesystem access enabled',
                    'Common.util.Environment'));
			return false;
		} else {
			console.log(LocaleManager.getLocalizedString('Running in Browser Mode. Filesystem access disabled',
                    'Common.util.Environment'));
			return true;
		}
	},

    // TODO: Rename isNativeMode
    getNativeMode: function () {
        if (Ext.browser.is.PhoneGap) {
            return Ext.browser.is.PhoneGap && !Ext.os.is.Desktop;
        } else {
            return false;
        }
    }

});