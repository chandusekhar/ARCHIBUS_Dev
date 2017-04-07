Ext.define('AppLauncher.view.tablet.Preferences', {
    extend: 'Ext.Container',

    xtype: 'preferencesPanel',

    requires: 'AppLauncher.view.PreferenceList',

    config: {
        zIndex: 6,
        items: [
            {
                xtype: 'setting'
            },
            {
                xtype: 'preferenceList',
                width: 250,
                docked: 'left',
                store: 'Preferences',
                items: [
                    {
                        xtype: 'titlebar',
                        title: LocaleManager.getLocalizedString('Preferences', 'AppLauncher.view.tablet.Preferences'),
                        docked: 'top'
                    }
                ]
            },
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Setting', 'AppLauncher.view.tablet.Preferences'),
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        text: Common.lang.LocalizedStrings.z_Done,
                        action: 'settingsDone',
                        align: 'right'
                    }
                ]
            }
        ]
    }


});
