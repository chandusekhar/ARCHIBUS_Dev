Ext.define('MaterialInventory.model.prompt.EditUser', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'last_edited_by',
                type: 'string'
            }
        ]
    }
});