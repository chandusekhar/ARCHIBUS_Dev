Ext.define('Maintenance.store.manager.StorageLocationBuilding', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'Maintenance.store.manager.StorageLocations',
        'Maintenance.store.manager.PartStorageLocations',
        'Maintenance.store.Buildings'
    ],
    serverTableName: 'pt_store_loc_pt',
    config: {
        storeId: 'storageLocationBuilding',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        disablePaging: true,
        usesTransactionTable: true,

        fields: [
            {name: 'pt_store_loc_id',type: 'string'},
            {name: 'part_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'qty_on_hand', type: 'float', defaultValue: 0},
            {name: 'lon', type: 'float'},
            {name: 'lat', type: 'float'}
        ],


        proxy: {
            type: 'SqliteView',

            /*
             viewDefinition: 'select part_id,bl_id,lon,lat,(select ifnull(sum(qty_on_hand),0) from PartStorageLocation pt_store_loc_pt ' +
             'where pt_store_loc_pt.pt_store_loc_id in (select pt_store_loc_id from StorageLocation pt_store_loc where pt_store_loc.bl_id=bl.bl_id)) AS qty_on_hand ' +
             'from Building bl ' +
             'where lon is not null and lat is not null ' +
             'and exists (select 1 from StorageLocation pt_store_loc where pt_store_loc.bl_id=bl.bl_id)',
             */

            viewDefinition: 'SELECT psl.pt_store_loc_id,psl.part_id,bl.bl_id,psl.qty_on_hand,bl.lon,bl.lat ' +
            'FROM PartStorageLocation AS psl ' +
            'JOIN StorageLocation sl ON psl.pt_store_loc_id=sl.pt_store_loc_id ' +
            'JOIN Building bl ON sl.bl_id=bl.bl_id',


            viewName: 'storageLocationBuildingView',

            baseTables: ['Building', 'PartStorageLocation', 'StorageLocation']
        },
        sorters: [
            {property: 'pt_store_loc_id', direction: 'ASC'}
        ]
    }
})
;
