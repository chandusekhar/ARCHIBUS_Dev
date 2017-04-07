Ext.define('MaterialInventory.store.space.ShelvesWithMaterials', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.space.ShelfWithMaterials'
    ],

    config: {
        storeId: 'shelvesWithMaterials',
        model: 'MaterialInventory.model.space.ShelfWithMaterials',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT bl_id, fl_id, rm_id, aisle_id, cabinet_id, shelf_id FROM MaterialLocation WHERE shelf_id is not null AND shelf_id <> \'\'',
            viewName: 'ShelvesWithMaterials',

            baseTables: ['MaterialLocation']
        }
    }
});