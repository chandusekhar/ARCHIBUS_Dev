/**
 * Craftsperson domain class
 * @since 21.1
 */
Ext.define('Common.model.Craftsperson', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'cf_id',
                type: 'string'
            },
            {
                name: 'email',
                type: 'string'
            }
        ]
    }
});