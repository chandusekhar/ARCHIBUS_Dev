Ext.define('AssetAndEquipmentSurvey.view.TaskDocuments', {
    extend: 'Common.view.DocumentList',

    xtype: 'taskDocumentList',

    config: {
        enableImageRedline: true,
        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all',
                appName: 'AssetAndEquipmentSurvey'
            }
        ]
    }

});