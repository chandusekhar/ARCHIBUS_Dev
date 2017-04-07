Ext.define('AssetReceipt.store.AssetReceiptDepartments', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'AssetReceipt.model.AssetReceiptDepartment'
    ],

    config: {
        storeId: 'assetReceiptDepartments',
        model: 'AssetReceipt.model.AssetReceiptDepartment',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT dv_id, dp_id FROM AssetReceiptRoom WHERE dp_id IS NOT NULL',
            viewName: 'AssetReceiptDepartment',

            baseTables: ['AssetReceiptRoom']
        }
    }
});