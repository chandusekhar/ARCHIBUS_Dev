Ext.define('MaterialInventory.model.prompt.PressureUnit', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'bill_unit_id',
                type: 'string'
            },
            {
                name: 'bill_type_id',
                type: 'string'
            },
            {
                name: 'is_dflt',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            }
        ]
    }
});