Ext.define('AssetReceipt.store.AssetReceiptEmployees', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['AssetReceipt.model.AssetReceiptEmployee'],

    serverTableName: 'em',

    serverFieldNames: ['em_id', 'bl_id', 'fl_id', 'rm_id'],
    inventoryKeyNames: ['em_id'],

    config: {
        model: 'AssetReceipt.model.AssetReceiptEmployee',
        storeId: 'assetReceiptEmployees',
        remoteSort: true,
        remoteFilter: true,
        sorters: [
            {
                property: 'em_id',
                direction: 'ASC'
            }
        ],
        tableDisplayName: LocaleManager.getLocalizedString('Employees', 'AssetReceipt.store.AssetReceiptEmployees'),
        enableAutoLoad: true,
        autoLoad: false,
        proxy: {
            type: 'Sqlite'
        },
        timestampDownload: false
    }
});