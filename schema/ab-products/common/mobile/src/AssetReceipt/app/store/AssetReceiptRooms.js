Ext.define('AssetReceipt.store.AssetReceiptRooms', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['AssetReceipt.model.AssetReceiptRoom'],

    serverTableName: 'rm',

    serverFieldNames: ['bl_id', 'fl_id', 'rm_id', 'dv_id', 'dp_id'],
    inventoryKeyNames: ['bl_id', 'fl_id', 'rm_id'],

    config: {
        model: 'AssetReceipt.model.AssetReceiptRoom',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Rooms', 'AssetReceipt.store.AssetReceiptRooms'),
        sorters: [
            {
                property: 'bl_id',
                direction: 'ASC'
            },
            {
                property: 'fl_id',
                direction: 'ASC'
            },
            {
                property: 'rm_id',
                direction: 'ASC'
            }
        ],
        storeId: 'assetReceiptRooms',
        enableAutoLoad: true,
        autoLoad: false,
        proxy: {
            type: 'Sqlite'
        },
        timestampDownload: false
    }
});