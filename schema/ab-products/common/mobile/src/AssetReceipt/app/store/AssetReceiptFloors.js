Ext.define('AssetReceipt.store.AssetReceiptFloors', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['AssetReceipt.model.AssetReceiptFloor'],

    serverTableName: 'fl',
    serverFieldNames: ['bl_id', 'fl_id', 'name'],
    inventoryKeyNames: ['bl_id', 'fl_id'],

    config: {
        model: 'AssetReceipt.model.AssetReceiptFloor',
        remoteFilter: true,
        remoteSort: true,
        sorters: [{
            property: 'bl_id',
            direction: 'ASC'
        }, {
            property: 'fl_id',
            direction: 'ASC'
        }],
        tableDisplayName: LocaleManager.getLocalizedString('Floors', 'AssetReceipt.store.AssetReceiptFloors'),
        storeId: 'assetReceiptFloors',
        enableAutoLoad: true,
        autoLoad: false,
        proxy: {
            type: 'Sqlite'
        },
        timestampDownload: false
    }
});