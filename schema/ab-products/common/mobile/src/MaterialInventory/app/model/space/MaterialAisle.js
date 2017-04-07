Ext.define('MaterialInventory.model.space.MaterialAisle', {
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
                name: 'name',
                type: 'string'
            },
            {
                name: 'has_materials',
                type: 'int',
                defaultValue: 0,
                isSyncField: false
            },
            {
                name: 'done_inventory_date',
                type: 'DateClass',
                defaultValue: '',
                isSyncField: false
            }
        ]
    }
});