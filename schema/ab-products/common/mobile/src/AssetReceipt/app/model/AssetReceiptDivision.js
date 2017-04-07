Ext.define('AssetReceipt.model.AssetReceiptDivision', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'dv_id',
                type: 'string'
            }
        ]
    }
});