/**
 * User domain object
 * @since 21.1
 */
Ext.define('Common.model.User', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'user_name',
                type: 'string'
            },
            {
                name: 'email',
                type: 'string'
            }
        ]
    }
});