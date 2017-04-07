/**
 * UserProfile domain class
 * @since 21.1
 */
Ext.define('Common.model.UserProfile', {
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
            },
            {
                name: 'cf_id',
                type: 'string'
            },
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'phone',
                type: 'string'
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
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'site_id',
                type: 'string'
            }
        ]
    }
});