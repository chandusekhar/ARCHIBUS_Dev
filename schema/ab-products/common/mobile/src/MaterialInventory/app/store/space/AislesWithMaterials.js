Ext.define('MaterialInventory.store.space.AislesWithMaterials', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.space.AisleWithMaterials'
    ],

    config: {
        storeId: 'aislesWithMaterials',
        model: 'MaterialInventory.model.space.AisleWithMaterials',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT bl_id, fl_id, rm_id, aisle_id FROM MaterialLocation WHERE aisle_id is not null and aisle_id <>\'\'' ,
            viewName: 'AislesWithMaterials',

            baseTables: ['MaterialLocation']
        }
    }
});