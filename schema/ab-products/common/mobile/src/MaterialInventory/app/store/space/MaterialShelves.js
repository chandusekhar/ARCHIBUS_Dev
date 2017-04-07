Ext.define('MaterialInventory.store.space.MaterialShelves', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.space.MaterialShelf'],

    serverTableName: 'shelf',

    serverFieldNames: ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'name'],
    inventoryKeyNames: ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id'],

    config: {
        model: 'MaterialInventory.model.space.MaterialShelf',
        tableDisplayName: LocaleManager.getLocalizedString('Shelves', 'MaterialInventory.store.MaterialShelves'),
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
            },
            {
                property: 'cabinet_id',
                direction: 'ASC'
            },
            {
                property: 'shelf_id',
                direction: 'ASC'
            }
        ],
        storeId: 'materialShelves',
        enableAutoLoad: true,
        autoSync: false,
        proxy: {
            type: 'Sqlite'
        }

    }
});