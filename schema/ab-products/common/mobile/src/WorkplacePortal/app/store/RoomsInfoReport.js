/**
 * Read only store containing fields used by the Room Report.
 * This view contains information from Building, Floor and Room Standard for the Room
 *
 * @author Ana Paduraru
 * @since 22.1
 */
Ext.define('WorkplacePortal.store.RoomsInfoReport', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'Common.store.proxy.SqliteView',
        'WorkplacePortal.model.RoomInfoReport', 
        'Common.model.RoomStandard'
    ],

    config: {
        storeId: 'roomsInfoReportStore',
        model: 'WorkplacePortal.model.RoomInfoReport',
        autoLoad: false,
        enableAutoLoad: false,  // The store is loaded when the Room Info report is requested.
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'select bl.site_id, bl.ctry_id, bl.state_id, bl.city_id, bl.address1, bl.address2, ' +
                'bl.name as bl_name, fl.name as fl_name, ' +
                'rm.bl_id,rm.fl_id,rm.rm_id,rm.name,rm.rm_type,rm.rm_cat,rm.rm_std, rm.area, rm.dv_id,rm.dp_id, ' +
                'rmstd.doc_graphic, rmstd.doc_graphic_contents, rmstd.doc_block, rmstd.doc_block_contents, rm.phone ' +
                'FROM Room rm JOIN SpaceBuilding bl ON rm.bl_id = bl.bl_id ' +
                'JOIN SpaceFloor fl ON rm.bl_id = fl.bl_id AND rm.fl_id = fl.fl_id ' +
                'LEFT JOIN RoomStandard rmstd ON rm.rm_std = rmstd.rm_std',

            viewName: 'RoomsInfoReport',

            baseTables: [ 'SpaceBuilding', 'SpaceFloor', 'Room', 'RoomStandard' ]
        }
    }
});