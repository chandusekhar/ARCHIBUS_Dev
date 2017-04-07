Ext.define('WorkplacePortal.model.HotelingBookingSearch', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'auto'
            },
            {
                name: 'pct_id',
                type: 'IntegerClass'
            },
            {
                name: 'date_start',
                type: 'DateClass',
                defaultValue: new Date()
            },
            {
                name: 'duration',
                type: 'IntegerClass',
                defaultValue: 1
            },
            {
                name: 'date_end',
                type: 'DateClass',
                defaultValue: new Date()
            },
            {
                name: 'day_part',
                type: 'IntegerClass',
                defaultValue: 0
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
                name: 'rm_std',
                type: 'string'
            },
            {
                name: 'rm_cat',
                type: 'string'
            },
            {
                name: 'rm_type',
                type: 'string'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            }
        ]
    }

});
