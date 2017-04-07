Ext.define('MaterialInventory.store.space.MaterialFloors', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: 'MaterialInventory.model.space.MaterialFloor',

    serverTableName: 'fl',
    serverFieldNames: [
        'bl_id',
        'fl_id',
        'name'
    ],

    inventoryKeyNames: [
        'bl_id',
        'fl_id'
    ],

    config: {
        model: 'MaterialInventory.model.space.MaterialFloor',
        sorters: [
            {
                property: 'fl_id',
                direction: 'ASC'
            }
        ],
        storeId: 'materialFloors',
        enableAutoLoad: true,
        autoSync: false,
        remoteFilter: true,
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Floors', 'MaterialInventory.store.space.MaterialFloors'),
        timestampDownload: false
    }
});