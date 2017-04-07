Ext.define('MaterialInventory.store.space.MaterialRooms', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.space.MaterialRoom'],

    serverTableName: 'rm',

    serverFieldNames: ['bl_id', 'fl_id', 'rm_id', 'rm_std', 'name'],
    inventoryKeyNames: ['bl_id', 'fl_id', 'rm_id'],

    config: {
        model: 'MaterialInventory.model.space.MaterialRoom',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Rooms', 'MaterialInventory.store.MaterialLocations'),
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
        storeId: 'materialRooms',
        enableAutoLoad: true,
        autoSync: false,
        proxy: {
            type: 'Sqlite'
        },
        timestampDownload: false

    }
});