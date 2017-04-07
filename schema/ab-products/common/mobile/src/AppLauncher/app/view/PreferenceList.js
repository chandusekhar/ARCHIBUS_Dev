Ext.define('AppLauncher.view.PreferenceList', {
    extend: 'Ext.dataview.List',

    xtype: 'preferenceList',

    config: {
        title: LocaleManager.getLocalizedString('Preferences', 'AppLauncher.view.PreferenceList'),
        style: 'border-right:1px solid black',
        onItemDisclosure: Ext.os.is.Phone ? true: false
    }
});