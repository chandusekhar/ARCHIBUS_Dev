Ext.define('Maintenance.model.manager.Trade', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'tr_id',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'rate_hourly',
                type: 'float'
            }
        ]
    }
});