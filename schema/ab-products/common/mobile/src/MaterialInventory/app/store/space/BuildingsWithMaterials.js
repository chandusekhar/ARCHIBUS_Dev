Ext.define('MaterialInventory.store.space.BuildingsWithMaterials', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.space.BuildingWithMaterials'
    ],

    config: {
        storeId: 'buildingsWithMaterials',
        model: 'MaterialInventory.model.space.BuildingWithMaterials',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT bl_id FROM MaterialLocation',
            viewName: 'BuildingsWithMaterials',

            baseTables: ['MaterialLocation']
        }
    }
});