Ext.define('ConditionAssessment.model.ActivityType', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'activity_type',
                type: 'string'
            }
        ]
    }
});
