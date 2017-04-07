Ext.define('Maintenance.view.WorkRequestDocuments', {
    extend: 'Common.view.DocumentList',
    xtype: 'workRequestDocumentList',

    config: {
        enableImageRedline: true,

        enableDelete: true,

        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all'
            }
        ]
    },

    getDocuments: function (record) {
        return record.getDocumentFieldsAndData();

    }
});