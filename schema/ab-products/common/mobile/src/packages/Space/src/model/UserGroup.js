Ext.define('Space.model.UserGroup', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'userName',
                type: 'string'
            },
            {
                name: 'groupName',
                type: 'string'
            },
            {
                name: 'isMember',
                type: 'boolean'
            }
        ]
    }
});