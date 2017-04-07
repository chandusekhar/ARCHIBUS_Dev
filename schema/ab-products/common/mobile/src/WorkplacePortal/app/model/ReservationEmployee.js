Ext.define('WorkplacePortal.model.ReservationEmployee', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'em_id',
                type: 'string'
            },

            {
                name: 'email',
                type: 'string'
            },

            {
                name: 'phone',
                type: 'string'
            }
        ]
    }
});