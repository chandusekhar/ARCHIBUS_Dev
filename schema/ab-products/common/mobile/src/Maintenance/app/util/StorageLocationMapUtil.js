Ext.define('Maintenance.util.StorageLocationMapUtil', {
    alternateClassName: ['StorageLocationMapUtil'],

    singleton: true,

    /**
     * Create new store by Part Code and return store Id.
     * @param partCode Part Code
     * @returns {string} Store Id
     */
    getStoreCreateByPartCode: function(partCode){
        var storeId='storageLocationBuildingForParts';
        var model="Maintenance.model.manager.StorageLocationBuildingByPartsForMap";
        var viewDefineSql="";
        if(!Ext.isEmpty(partCode)){
            viewDefineSql=
                "select pt_store_loc.pt_store_loc_id,pt_store_loc.pt_store_loc_name,pt_store_loc.bl_id,bl.lon,bl.lat," +
                "'"+partCode+"' as part_id,"+
                "(" +
                    "select quantityShow from " +
                    "(" +
                        "select bl_id,max(QuantityAvaliable) AS quantityShow from " +
                        "( " +
                            "select pt_store_loc_id,pt_store_loc_name,site_id,bl_id," +
                            "(select ifnull(sum(qty_on_hand),0) from PartStorageLocation pt_store_loc_pt where pt_store_loc_pt.pt_store_loc_id=pt_store_loc.pt_store_loc_id and part_id='"+partCode+"') AS QuantityAvaliable " +
                            "from StorageLocation pt_store_loc " +
                            "where pt_store_loc.bl_id is not null" +
                        ") Level1 " +
                        "group by bl_id" +
                    ") Level2 " +
                    "where Level2.bl_id=pt_store_loc.bl_id" +
                    ") AS qty_on_hand," +
                "(select ifnull(sum(qty_on_hand),0) from PartStorageLocation pt_store_loc_pt where pt_store_loc_pt.pt_store_loc_id=pt_store_loc.pt_store_loc_id and part_id='"+partCode+"') AS qty_on_hand_show " +
                "from StorageLocation pt_store_loc,Building bl where bl.bl_id=pt_store_loc.bl_id " +
                "and bl.lon is not null and bl.lat is not null";
        }


        var store=Ext.create("Common.store.sync.SqliteStore",{
            model:model,

            storeId: storeId,
            autoLoad: false,
            enableAutoLoad: true,
            remoteFilter: true,
            disablePaging: true,
            usesTransactionTable: true,
            proxy: {
                type: 'SqliteView',

                viewDefinition: viewDefineSql,

                viewName: 'storageLocationBuildingForPartsView',

                baseTables: ['Building', 'PartStorageLocation', 'StorageLocation']
            },
            sorters: [
                {property: 'pt_store_loc_id', direction: 'ASC'}
            ]
        });

        store.serverTableName= 'pt_store_loc_pt';

        return storeId;
    },
    /**
     *Create new store For Storage Location and return store Id.
     * @returns {string} Store Id
     */
    getStoreCreateByStorageLocation: function(){
        var storeId='storageLocationBuilding';
        var model='Maintenance.model.manager.StorageLocationBuildingForMap';

        var viewDefinationSql=
            "SELECT sl.pt_store_loc_id,sl.pt_store_loc_name,sl.pt_store_loc_name,bl.bl_id,bl.lon,bl.lat " +
            "FROM StorageLocation sl JOIN Building bl ON sl.bl_id=bl.bl_id " +
            "where sl.bl_id is not null  and bl.lon is not null and bl.lat is not null"

        var store=Ext.create("Common.store.sync.SqliteStore",{
            model:model,

            storeId: storeId,
            autoLoad: false,
            enableAutoLoad: true,
            remoteFilter: true,
            disablePaging: true,
            usesTransactionTable: true,


            proxy: {
                type: 'SqliteView',

                viewDefinition: viewDefinationSql,


                viewName: 'storageLocationBuildingView',

                baseTables: ['Building', 'PartStorageLocation', 'StorageLocation']
            },
            sorters: [
                {property: 'pt_store_loc_id', direction: 'ASC'}
            ]
        });

        store.serverTableName= 'pt_store_loc';

        return storeId;
    },


    getWorkRequestStore: function(){
        var storeId='workRequestBuilding';
        var model='Maintenance.model.manager.WorkRequestBuildingForMap';

        var viewDefinationSql=
            "SELECT wr.wr_id,wr.bl_id,bl.lon,bl.lat " +
            "FROM WorkRequest wr JOIN Building bl ON wr.bl_id=bl.bl_id " +
            "where wr.bl_id is not null  and bl.lon is not null and bl.lat is not null"

        var store=Ext.create("Common.store.sync.SqliteStore",{
            model:model,

            storeId: storeId,
            autoLoad: false,
            enableAutoLoad: true,
            remoteFilter: true,
            disablePaging: true,
            usesTransactionTable: true,


            proxy: {
                type: 'SqliteView',

                viewDefinition: viewDefinationSql,


                viewName: 'workRequestBuildingView',

                baseTables: ['Building', 'WorkRequest']
            },
            sorters: [
                {property: 'wr_id', direction: 'ASC'}
            ]
        });

        store.serverTableName= 'wr';

        return storeId;
    },

    getWorkRequestByPartBuildingStore: function(wrId,storageLocationCode){
        var storeId='workRequestByPartBuilding';
        var model='Maintenance.model.manager.WorkRequestBuildingForMap';
        var whereClause="";
        if(!Ext.isEmpty(storageLocationCode)){
            whereClause="and wr.bl_id in (select sl.bl_id from storageLocation sl,Building bl where sl.bl_id=bl.bl_id and bl.lon is not null and bl.lat is not null and sl.pt_store_loc_id='"+storageLocationCode+"')";
        }else{
            whereClause="and wr.bl_id in (select sl.bl_id from storageLocation sl,Building bl where sl.bl_id=bl.bl_id and bl.lon is not null and bl.lat is not null)";
        }

        var viewDefinationSql=
            "SELECT wr.wr_id,wr.bl_id,bl.lon,bl.lat " +
            "FROM WorkRequest wr JOIN Building bl ON wr.bl_id=bl.bl_id " +
            "where wr.bl_id is not null  and bl.lon is not null and bl.lat is not null and wr.wr_id='"+wrId+"' " +whereClause;

        var store=Ext.create("Common.store.sync.SqliteStore",{
            model:model,

            storeId: storeId,
            autoLoad: false,
            enableAutoLoad: true,
            remoteFilter: true,
            disablePaging: true,
            usesTransactionTable: true,


            proxy: {
                type: 'SqliteView',

                viewDefinition: viewDefinationSql,


                viewName: 'workRequestByPartBuildingView',

                baseTables: ['Building', 'WorkRequest','StorageLocation']
            },
            sorters: [
                {property: 'wr_id', direction: 'ASC'}
            ]
        });

        return store;
    }


});
