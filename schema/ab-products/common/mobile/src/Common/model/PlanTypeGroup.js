Ext.define('Common.model.PlanTypeGroup', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'plan_type',
                type: 'string'
            },
            {
                name: 'mob_activity_id',
                type: 'string'
            },
            {
                name: 'plantype_group',
                type: 'string'
            },
            {
                name: 'active',
                type: 'int'
            },
            {
                name: 'display_order',
                type: 'int'
            }
        ]
    }
});