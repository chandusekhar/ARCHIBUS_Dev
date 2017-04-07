/**
 * Provides controller functionality which is common for all applications:
 *  - common UI event handlers;
 *
 * @author Jeff Martin
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.controller.AppHomeController', {
    extend: 'Ext.app.Controller',
    requires: 'Common.controller.EventBus',

    config: {
        control: {
            'button[action=backToAppLauncher]': {
                tap: 'navigateToAppLauncher'
            }
        },

        appLaunchKey: 'Ab.AppLauncher'
    },

    launch: function () {
        Common.controller.EventBus.on('navigateToAppLauncher', this.navigateToAppLauncher, this);

        // Required for the viewport orientation change event to fire on Android devices
        if(Ext.os.is.Android) {
            Ext.Viewport.bodyElement.on('resize', Ext.emptyFn, this, { buffer: 1});
        }
    },

    navigateToAppLauncher: function () {
        var appLauncherUrl,
            applicationName = this.getApplication().getName(),
            currentUrl = document.location.href;

        // Set the localStorage to indicate to the AppLauncher that we are returning from
        // a launched app
        this.setAppLaunchedKey();
        appLauncherUrl = currentUrl.replace(applicationName, 'AppLauncher');
        document.location.href = appLauncherUrl;
    },

    setAppLaunchedKey: function () {
        var key = this.getAppLaunchKey();

        localStorage.setItem(key, true);
    }
});
