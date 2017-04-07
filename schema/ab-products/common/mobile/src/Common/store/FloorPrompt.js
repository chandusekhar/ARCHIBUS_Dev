/**
 * Read only store containing fields used by the Floor prompt control. This view contains
 * the site_id field which allows the Floor prompt to interact with the Site prompt
 *
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.store.FloorPrompt', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView'],

    config: {
        storeId: 'floorPromptStore',
        fields: [
            {name: 'site_id', type: 'string'},
            {name: 'pr_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'fl_id', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'bl_name', type: 'string'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'select bl.site_id, bl.pr_id, bl.name as bl_name, f.bl_id, f.fl_id, f.name ' +
            'from Floor f join Building bl on f.bl_id = bl.bl_id',

            viewName: 'floorPrompt',

            baseTables: ['Building', 'Floor']
        }
    }
});
