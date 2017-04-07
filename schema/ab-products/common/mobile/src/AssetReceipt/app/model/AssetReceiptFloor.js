Ext.define('AssetReceipt.model.AssetReceiptFloor', {
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
            }
        ],

        sqlIndexes: [
            {
                indexName: 'idxAssetReceiptFloorBlId',
                fields: ['bl_id']
            },
            {
                indexName: 'idxAssetReceiptFloorFlId',
                fields: ['fl_id']
            }
        ]
    }
});