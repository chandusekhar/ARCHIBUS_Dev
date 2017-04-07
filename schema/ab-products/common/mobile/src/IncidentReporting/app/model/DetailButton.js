Ext.define('IncidentReporting.model.DetailButton', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'title',
                type: 'string'
            },
            {
                name: 'view_name',
                type: 'string'
            },
            {
                name: 'badge_value',
                type: 'int'
            }
        ]
    }
});