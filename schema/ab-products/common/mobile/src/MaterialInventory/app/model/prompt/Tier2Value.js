Ext.define('MaterialInventory.model.prompt.Tier2Value', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'msds_id',
                type: 'string'
            },
            {
                name: 'tier2',
                type: 'string'
            }
        ]
    }
});