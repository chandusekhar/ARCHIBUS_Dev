Ext.define('ConditionAssessment.model.AssessmentSite', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'site_id',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            }
        ]
    }
});