Ext.define('Maintenance.model.manager.Tool', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'tool_id',
                type: 'string'
            },
            {
                name: 'tool_type',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            }
        ]
    }
});