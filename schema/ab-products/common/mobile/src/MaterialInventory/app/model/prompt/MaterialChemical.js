Ext.define('MaterialInventory.model.prompt.MaterialChemical', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'chemical_id',
                type: 'string'
            },
            {
                name: 'tier2',
                type: 'string'
            }
        ]
    }
});