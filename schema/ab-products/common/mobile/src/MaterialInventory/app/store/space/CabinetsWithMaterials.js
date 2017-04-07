Ext.define('MaterialInventory.store.space.CabinetsWithMaterials', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.space.CabinetWithMaterials'
    ],

    config: {
        storeId: 'cabinetsWithMaterials',
        model: 'MaterialInventory.model.space.CabinetWithMaterials',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT bl_id, fl_id, rm_id, aisle_id, cabinet_id FROM MaterialLocation WHERE cabinet_id is not null AND cabinet_id <> \'\'',
            viewName: 'CabinetsWithMaterials',

            baseTables: ['MaterialLocation']
        }
    }
});