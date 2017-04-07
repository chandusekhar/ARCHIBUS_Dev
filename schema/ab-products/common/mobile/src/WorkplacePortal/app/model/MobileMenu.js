Ext.define('WorkplacePortal.model.MobileMenu', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'menu_id',
                type: 'string'
            },
            {
                name: 'title',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'menu_icon',
                type: 'string'
            },
            {
                name: 'menu_icon_contents',
                type: 'string',
                isSyncField: false
            },
            {
                name: 'activity_id',
                type: 'string'
            },
            {
                name: 'mobile_action',
                type: 'string'
            },
            {
                name: 'display_order',
                type: 'IntegerClass'
            },
            {
                name: 'group_name',
                type: 'string'
            }
        ]
    }
});
