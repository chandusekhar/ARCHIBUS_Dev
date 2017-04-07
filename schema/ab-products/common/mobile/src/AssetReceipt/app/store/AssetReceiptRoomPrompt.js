/**
 * Read only store containing fields used by the Room prompt control. This view contains
 * the site_id field which allows the Room prompt to interact with the Site prompt
 *
 */
Ext.define('AssetReceipt.store.AssetReceiptRoomPrompt', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView'],

    config: {
        storeId: 'assetReceiptRoomPrompt',
        fields: [
            {name: 'site_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'fl_id', type: 'string'},
            {name: 'rm_id', type: 'string'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT bl.site_id,rm.bl_id,rm.fl_id,rm.rm_id ' +
            'FROM AssetReceiptRoom rm JOIN Building bl ON rm.bl_id = bl.bl_id',

            viewName: 'assetReceiptRoomPrompt',

            baseTables: ['Building', 'AssetReceiptRoom']
        }
    }
});