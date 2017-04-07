/**
 * Read only store containing fields used by the Room Report.
 * This view contains information from Building and Floor for the Room
 *
 * @author Ana Paduraru
 * @since 21.2
 */
Ext.define('Space.store.RoomsReport', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView',
        'Space.model.RoomReport'],

    inventoryKeyNames: [ 'rm_id' ],

    config: {
        storeId: 'roomsReportStore',
        model: 'Space.model.RoomReport',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'select bl.site_id, bl.ctry_id, bl.state_id, bl.city_id, bl.address1, bl.address2, ' +
                'bl.name as bl_name, fl.name as fl_name, ' +
                'rm.bl_id,rm.fl_id,rm.rm_id,rm.name,rm.rm_type,rm.rm_cat,rm.rm_std, rm.area, rm.dv_id,rm.dp_id, ' +
                'rm.survey_photo, rm.survey_photo_contents ' +
                'FROM Room rm JOIN SpaceBuilding bl ON rm.bl_id = bl.bl_id ' +
                'JOIN SpaceFloor fl ON rm.bl_id = fl.bl_id AND rm.fl_id = fl.fl_id',

            viewName: 'RoomsReport',

            baseTables: [ 'SpaceBuilding', 'SpaceFloor', 'Room' ]
        }
    }
});