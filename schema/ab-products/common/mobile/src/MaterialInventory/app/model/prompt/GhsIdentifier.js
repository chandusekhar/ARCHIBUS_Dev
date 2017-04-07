Ext.define('MaterialInventory.model.prompt.GhsIdentifier', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'ghs_id',
                type: 'string'
            }
        ]
    }
});