Ext.define('MaterialInventory.model.space.CabinetWithMaterials', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'fl_id',
                type: 'string'
            },
            {
                name: 'rm_id',
                type: 'string'
            },
            {
                name: 'aisle_id',
                type: 'string'
            },
            {
                name: 'cabinet_id',
                type: 'string'
            }
        ]
    }
});