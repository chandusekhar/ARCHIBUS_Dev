Ext.define('MaterialInventory.model.prompt.MaterialEmployee', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            }
        ]
    }
});