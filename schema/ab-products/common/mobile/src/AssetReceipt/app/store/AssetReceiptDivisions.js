Ext.define('AssetReceipt.store.AssetReceiptDivisions', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'AssetReceipt.model.AssetReceiptDivision'
    ],

    config: {
        storeId: 'assetReceiptDivisions',
        model: 'AssetReceipt.model.AssetReceiptDivision',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT dv_id FROM AssetReceiptRoom WHERE dv_id IS NOT NULL',
            viewName: 'AssetReceiptDivision',

            baseTables: ['AssetReceiptRoom']
        }
    }
});