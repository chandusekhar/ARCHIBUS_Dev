Ext.define('WorkplacePortal.view.ServiceDeskDocuments', {
    extend: 'Common.view.DocumentList',

    xtype: 'serviceDeskDocumentList',

    config: {
        enableImageRedline: true,
        enableDelete: true,
        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all',
                appName: 'WorkplacePortal'
            }
        ]
    }

});