Ext.define('ConditionAssessment.model.AssessmentProjectFloor', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'project_id',
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
                name: 'date_created',
                type: 'date'
            }
        ]
    }
});