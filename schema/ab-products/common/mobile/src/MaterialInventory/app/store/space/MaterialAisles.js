Ext.define('MaterialInventory.store.space.MaterialAisles', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.space.MaterialAisle'],

    serverTableName: 'aisle',

    serverFieldNames: ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'name'],
    inventoryKeyNames: ['bl_id', 'fl_id', 'rm_id', 'aisle_id'],

    config: {
        model: 'MaterialInventory.model.space.MaterialAisle',
        tableDisplayName: LocaleManager.getLocalizedString('Aisles', 'MaterialInventory.store.MaterialAisles'),
        remoteSort: true,
        remoteFilter: true,
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
            }
        ],
        storeId: 'materialAisles',
        enableAutoLoad: true,
        autoSync: false,
        proxy: {
            type: 'Sqlite'
        }

    }
});