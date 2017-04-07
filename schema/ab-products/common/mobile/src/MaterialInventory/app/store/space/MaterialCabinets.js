Ext.define('MaterialInventory.store.space.MaterialCabinets', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.space.MaterialCabinet'],

    serverTableName: 'cabinet',

    serverFieldNames: ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'name'],
    inventoryKeyNames: ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id'],

    config: {
        model: 'MaterialInventory.model.space.MaterialCabinet',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Cabinets', 'MaterialInventory.store.MaterialCabinets'),
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
            },
            {
                property: 'aisle_id',
                direction: 'ASC'
            },
            {
                property: 'cabinet_id',
                direction: 'ASC'
            }
        ],
        storeId: 'materialCabinets',
        enableAutoLoad: true,
        autoSync: false,
        proxy: {
            type: 'Sqlite'
        }

    }
});