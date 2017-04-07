Ext.define('AssetReceipt.model.AssetReceiptRoom', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'fl_id',
                type: 'string'
            },
            {
                name: 'rm_id',
                type: 'string'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            }
        ],

        sqlIndexes: [
            {
                indexName: 'idxAssetReceiptRoomBlId',
                fields: ['bl_id']
            }
        ]
    }
});