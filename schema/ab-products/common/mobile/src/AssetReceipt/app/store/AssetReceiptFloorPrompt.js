/**
 * Read only store containing fields used by the Floor prompt control. This view contains
 * the site_id field which allows the Floor prompt to interact with the Site prompt
 *
 */
Ext.define('AssetReceipt.store.AssetReceiptFloorPrompt', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView'],

    config: {
        storeId: 'assetReceiptFloorPrompt',
        fields: [
            {name: 'site_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'fl_id', type: 'string'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT bl.site_id,f.bl_id,f.fl_id ' +
            'FROM AssetReceiptFloor f JOIN Building bl on f.bl_id = bl.bl_id',

            viewName: 'assetReceiptFloorPrompt',

            baseTables: ['Building', 'AssetReceiptFloor']
        }
    }
});
