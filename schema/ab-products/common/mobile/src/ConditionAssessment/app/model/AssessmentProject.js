Ext.define('ConditionAssessment.model.AssessmentProject', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'auto'
            },
            {
                name: 'project_id',
                type: 'string'
            },
            {
                name: 'project_type',
                type: 'string'
            },
            {
                name: 'date_created',
                type: 'date'
            }
        ]
    }
});
