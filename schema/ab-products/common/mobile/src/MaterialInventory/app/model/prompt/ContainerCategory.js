Ext.define('MaterialInventory.model.prompt.ContainerCategory', {
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
                name: 'description',
                type: 'string'
            }
        ]
    }
});