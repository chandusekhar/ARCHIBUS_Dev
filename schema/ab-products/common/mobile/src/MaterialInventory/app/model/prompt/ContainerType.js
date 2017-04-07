Ext.define('MaterialInventory.model.prompt.ContainerType', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'container_cat',
                type: 'string'
            },
            {
                name: 'container_type',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            }
        ]
    }
});