/**
 * Read only store containing fields used by the Room prompt control. This view contains
 * the site_id field which allows the Room prompt to interact with the Site prompt
 *
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('WorkplacePortal.store.RoomPrompt', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [ 'Common.store.proxy.SqliteView'],

    config: {
        storeId: 'workplaceRoomPromptStore',
        fields: [
            {name: 'site_id', type: 'string'},
            {name: 'pr_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'fl_id', type: 'string'},
            {name: 'rm_id', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'rm_type', type: 'string'},
            {name: 'rm_cat', type: 'string'},
            {name: 'rm_std', type: 'string'},
            {name: 'dv_id', type: 'string'},
            {name: 'dp_id', type: 'string'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'select bl.site_id,bl.pr_id,rm.bl_id,rm.fl_id,rm.rm_id,rm.name,rm.rm_type,rm.rm_cat,rm.rm_std,rm.dv_id,rm.dp_id ' +
                ' from Room rm JOIN SpaceBuilding bl ON rm.bl_id = bl.bl_id' +
                ' WHERE rm.name IS NOT NULL',

            viewName: 'workplaceRoomPrompt',

            baseTables: [ 'SpaceBuilding', 'Room' ]
        }
    }
});