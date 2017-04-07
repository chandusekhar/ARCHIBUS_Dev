Ext.define('Common.model.Division', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            }
        ]
    }
});