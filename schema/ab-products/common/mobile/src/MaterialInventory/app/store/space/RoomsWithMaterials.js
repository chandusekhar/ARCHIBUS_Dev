Ext.define('MaterialInventory.store.space.RoomsWithMaterials', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.space.RoomWithMaterials'
    ],

    config: {
        storeId: 'roomsWithMaterials',
        model: 'MaterialInventory.model.space.RoomWithMaterials',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT bl_id, fl_id, rm_id FROM MaterialLocation WHERE rm_id is not null AND rm_id <> \'\'',
            viewName: 'RoomsWithMaterials',

            baseTables: ['MaterialLocation']
        }
    }
});