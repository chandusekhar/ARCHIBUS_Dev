Ext.define('Maintenance.view.tablet.Main', {
    extend: 'Maintenance.view.Main',

    xtype: 'tabletMainview',

    config: {
        editViewClass: 'Maintenance.view.tablet.WorkRequestEdit',
        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Apps', 'Maintenance.view.tablet.Main'),
                cls: 'x-button-back',
                action: 'backToAppLauncher',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                iconCls: 'refresh',
                cls: 'ab-icon-action',
                action: 'syncWorkRequest',
                align: 'right',
                displayOn: 'all'
            }
        ]
    }
});