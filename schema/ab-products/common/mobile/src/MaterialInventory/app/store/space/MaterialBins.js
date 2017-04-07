Ext.define('MaterialInventory.store.space.MaterialBins', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.space.MaterialBin'],

    serverTableName: 'bin',

    serverFieldNames: ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'bin_id', 'name'],
    inventoryKeyNames: ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'bin_id'],

    config: {
        model: 'MaterialInventory.model.space.MaterialBin',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Bins', 'MaterialInventory.store.MaterialBins'),
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
            },
            {
                property: 'bin_id',
                direction: 'ASC'
            }
        ],
        storeId: 'materialBins',
        enableAutoLoad: true,
        autoSync: false,
        proxy: {
            type: 'Sqlite'
        }

    }
});