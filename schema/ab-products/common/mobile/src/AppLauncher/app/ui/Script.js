/**
 * Loads DWR scripts and checks if the connection is using SSO
 *
 * @singleton
 * @since 21.1
 * @author Jeff Martin
 */
Ext.define('AppLauncher.ui.Script', {
    singleton: true,

    ssoModeEnabled: false,

    isInSsoMode: function() {
        return Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function(isConnected) {
                if(isConnected) {
                    return MobileSecurityServiceAdapter.isSsoMode();
                } else {
                    return Promise.resolve(false);
                }
            });

    }
});