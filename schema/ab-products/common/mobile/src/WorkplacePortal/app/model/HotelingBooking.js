Ext.define('WorkplacePortal.model.HotelingBooking', {
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
                name: 'parent_pct_id',
                type: 'IntegerClass'
            },
            {
                name: 'activity_log_id',
                type: 'IntegerClass'
            },
            {
                name: 'date_start',
                type: 'DateClass',
                defaultValue: new Date()
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
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'status',
                type: 'int'
            },
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'visitor_id',
                type: 'IntegerClass'
            },
            {
                name: 'confirmed',
                type: 'int'
            }
        ]
    }

});
