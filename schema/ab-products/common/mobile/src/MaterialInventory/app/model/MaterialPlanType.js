Ext.define('MaterialInventory.model.MaterialPlanType', {
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
                name: 'active',
                type: 'int'
            },
            {
                name: 'title',
                type: 'string'
            },
            {
                name: 'mob_activity_id',
                type: 'string'
            },
            {
                name: 'display_order',
                type: 'int'
            },
            {
                name: 'view_file',
                type: 'string'
            },
            {
                name: 'hs_ds',
                type: 'string'
            },
            {
                name: 'label_ds',
                type: 'string'
            },
            {
                name: 'label_ht',
                type: 'float'
            },
            {
                name: 'view_file2',
                type: 'string'
            },
            {
                name: 'hs_ds2',
                type: 'string'
            },
            {
                name: 'label_ds2',
                type: 'string'
            },
            {
                name: 'label_ht2',
                type: 'float'
            }
        ]
    }
});