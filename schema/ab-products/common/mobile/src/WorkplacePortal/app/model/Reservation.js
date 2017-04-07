Ext.define('WorkplacePortal.model.Reservation', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'auto'
            },
            {
                name: 'res_id',
                type: 'IntegerClass'
            },
            {
                name: 'res_type',
                type: 'string'
            },
            {
                name: 'user_requested_by',
                type: 'string'
            },
            {
                name: 'user_requested_for',
                type: 'string'
            },
            {
                name: 'reservation_name',
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
                name: 'comments',
                type: 'string'
            },
            {
                name: 'attendees',
                type: 'string'
            }
        ]
    }

});
