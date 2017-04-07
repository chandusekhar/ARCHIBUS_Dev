Ext.define('MaterialInventory.store.space.FloorsWithMaterials', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.space.FloorWithMaterials'
    ],

    config: {
        storeId: 'floorsWithMaterials',
        model: 'MaterialInventory.model.space.FloorWithMaterials',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT bl_id, fl_id FROM MaterialLocation WHERE fl_id is not null AND fl_id <> \'\'',
            viewName: 'FloorsWithMaterials',

            baseTables: ['MaterialLocation']
        }
    }
});