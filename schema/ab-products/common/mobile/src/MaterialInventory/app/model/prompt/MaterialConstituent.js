Ext.define('MaterialInventory.model.prompt.MaterialConstituent', {
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
                name: 'chemical_id',
                type: 'string'
            }
        ]
    }
});