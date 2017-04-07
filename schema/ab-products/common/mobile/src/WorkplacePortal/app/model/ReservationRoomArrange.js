Ext.define('WorkplacePortal.model.ReservationRoomArrange', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'auto'
            },
            {
                name: 'config_id',
                type: 'string'
            },
            {
                name: 'rm_arrange_type_id',
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
                name: 'day_start',
                type: 'DateClass',
                defaultValue: new Date()
            },
            {
                name: 'time_start',
                type: 'TimeClass'
            },
            {
                name: 'time_end',
                type: 'TimeClass'
            },
            {
                name: 'capacity',
                type: 'IntegerClass',
                defaultValue: '5'
            }
        ],

        validations: [
            {
                type: 'presence',
                field: 'day_start'
            },
            {
                type: 'presence',
                field: 'time_start'
            },
            {
                type: 'presence',
                field: 'time_end'
            }
        ]
    }

});
