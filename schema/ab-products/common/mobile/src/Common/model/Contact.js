Ext.define('Common.model.Contact', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'contact_id',
                type: 'string'
            },
            {
                name: 'email',
                type: 'string'
            },
            {
                name: 'name_first',
                type: 'string'
            },
            {
                name: 'name_last',
                type: 'string'
            }
        ]
    }
});