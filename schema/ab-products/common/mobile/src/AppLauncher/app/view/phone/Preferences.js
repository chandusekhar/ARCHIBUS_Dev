Ext.define('AppLauncher.view.phone.Preferences', {
    extend: 'Ext.navigation.View',

    xtype: 'preferencesPanel',

    config: {
        zIndex: 6,
        defaultBackButtonText: LocaleManager.getLocalizedString('Back', 'AppLauncher.view.tablet.Preferences'),
        navigationBar: {
            items: {
                xtype: 'button',
                align: 'right',
                text: LocaleManager.getLocalizedString('Done','AppLauncher.view.tablet.Preferences'),
                action: 'settingsDone'
            },

            useTitleForBackButtonText: false
        },

        items: {
            xtype: 'preferenceList',
            store: 'Preferences'
        }
    }
});