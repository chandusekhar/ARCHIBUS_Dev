Ext.define('MaterialInventory.store.space.BinsWithMaterials', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.space.BinWithMaterials'
    ],

    config: {
        storeId: 'binsWithMaterials',
        model: 'MaterialInventory.model.space.BinWithMaterials',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT bl_id, fl_id, rm_id, aisle_id, cabinet_id, shelf_id, bin_id FROM MaterialLocation WHERE bin_id is not null AND bin_id <>\'\'',
            viewName: 'BinsWithMaterials',

            baseTables: ['MaterialLocation']
        }
    }
});