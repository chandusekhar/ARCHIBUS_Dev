Ext.define('AssetAndEquipmentSurvey.model.Survey', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'survey_id',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'status',
                type: 'string'
            },
            {
                name: 'survey_date',
                type: 'date'
            },
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'survey_fields',
                type: 'string'
            }
        ]


    }

});
