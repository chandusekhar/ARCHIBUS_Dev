Ext.define('MaterialInventory.model.prompt.Manufacturer', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'manufacturer_id',
                type: 'string'
            }
        ]
    }
});