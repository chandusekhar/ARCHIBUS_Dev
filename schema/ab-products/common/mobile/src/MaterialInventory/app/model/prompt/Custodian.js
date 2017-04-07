Ext.define('MaterialInventory.model.prompt.Custodian', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'custodian_id',
                type: 'string'
            }
        ]
    }
});