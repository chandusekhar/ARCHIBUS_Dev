Ext.define('WorkplacePortal.model.FacilityServicesMenu', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'activity_type',
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
                name: 'mobile_action',
                type: 'string'
            },
            {
                name: 'display_order',
                type: 'IntegerClass'
            }
        ]
    }
});
