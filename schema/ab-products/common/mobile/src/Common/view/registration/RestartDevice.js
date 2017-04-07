Ext.define('Common.view.registration.RestartDevice', {
    extend: 'Ext.Panel',

    xtype: 'restartdevice',

    ANDROID_TEXT: [
        LocaleManager.getLocalizedString('Tap the Home icon/button to return to the Home screen.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('From the Application menu screen, select Settings.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Select Application manager.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Select the Mobile Client app.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Tap the Force stop button.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Tap the Home button.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Open the Mobile Client app again.', 'AppLauncher.view.RestartDevice')
    ],

    IOS_TEXT: [
        LocaleManager.getLocalizedString('Click the Home button to return to the Home screen.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('From the Home screen, click the Home button twice.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Tap and hold on the Mobile Client app.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('When it starts to jiggle, tap the red (-) icon to close it.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Click the Home button and open the Mobile Client app again.', 'AppLauncher.view.RestartDevice')

    ],

    IOS7_TEXT: [
        LocaleManager.getLocalizedString('Click the Home button to return to the Home screen.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('From the Home screen, click the Home button twice.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Find the Mobile Client app. Swipe left or right if the app is not displayed', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Swipe up on the app to close it.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Click the Home button and open the Mobile Client app again.', 'AppLauncher.view.RestartDevice')
    ],

    GENERIC_TEXT: [
        LocaleManager.getLocalizedString('Stop the Mobile Client app.', 'AppLauncher.view.RestartDevice'),
        LocaleManager.getLocalizedString('Restart the Mobile Client app.', 'AppLauncher.view.RestartDevice')
    ],

    config: {
        layout: 'vbox',
        styleHtmlContent: true,
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Restart Mobile Client', 'AppLauncher.view.RestartDevice'),
                docked: 'top',
                cls: 'ab-titlebar'
            },
            {
                xtype: 'container',
                itemId: 'x-restart',
                style: 'padding:10px;margin:10px;width:90%'
            }
        ]

    },

    initialize: function () {
        var me = this,
            restartHtmlContainer = me.down('#x-restart');

        restartHtmlContainer.setHtml(me.generateHtmlMessage());
    },

    generateHtmlMessage: function() {
        var me = this,
            textArray,
            html = '<div class="restart-text"><ol>';

        if (Ext.os.is.iOS) {
            if (Ext.os.version.gtEq('7.0')) {
                textArray = me.IOS7_TEXT;
            } else {
                textArray = me.IOS_TEXT;
            }
        } else if (Ext.os.is.Android) {
            textArray = me.ANDROID_TEXT;
        } else {
            textArray = me.GENERIC_TEXT;
        }

        Ext.each(textArray, function(line) {
            html += Ext.String.format('<li>{0}</li>',line);
        }, me);

        html += '</ol></div>';

        return html;

    }
});