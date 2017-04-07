Ext.define('Common.model.IncidentType', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'incident_type',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            }
        ]
    }
});