Ext.define('ConditionAssessment.model.AssessmentProjectFloorRoom', {
    extend: 'Ext.data.Model',

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
                name: 'rm_id',
                type: 'string'
            }
        ]
    }
});