Ext.define('Maintenance.view.phone.Main', {
    extend: 'Maintenance.view.Main',

    xtype: 'phoneMainview',

    isNavigationList: true,

    config: {
        title: 'Work Requests',
        editViewClass: 'Maintenance.view.phone.WorkRequestEdit',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Apps', 'Maintenance.view.phone.Main'),
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