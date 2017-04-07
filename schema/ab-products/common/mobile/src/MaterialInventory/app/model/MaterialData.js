Ext.define('MaterialInventory.model.MaterialData', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'msds_id',
                type: 'IntegerClass'
            },
            {
                name: 'product_name',
                type: 'string'
            },
            {
                name: 'manufacturer_id',
                type: 'string'
            },
            {
                name: 'ghs_id',
                type: 'string'
            }
        ]
    }
});