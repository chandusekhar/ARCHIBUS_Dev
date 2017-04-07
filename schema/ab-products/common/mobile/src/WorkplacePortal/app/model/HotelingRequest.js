Ext.define('WorkplacePortal.model.HotelingRequest', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'activity_log_id',
                type: 'IntegerClass'
            }
        ]
    }
});
