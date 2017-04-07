Ext.define('Maintenance.view.tablet.WorkRequestEdit', {
    extend: 'Maintenance.view.WorkRequestEdit',

    requires: 'Common.control.Camera',

    xtype: 'tabletWorkRequestPanel',

    config: {

        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                action: 'locateWorkRequest',
                align: 'left',
                iconCls: 'locate',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Cancel', 'Maintenance.view.WorkRequestEdit'),
                align: 'right',
                action: 'workRequestCancel',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                iconCls: 'redline',
                align: 'right',
                action: 'openRedline',
                displayOn: 'all'
            }
        ]
    }

});
