Ext.define('Space.model.SpaceSurvey', {
    extend: 'Common.data.Model',

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
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'survey_date',
                type: 'DateClass',
                defaultValue: new Date()
            },
            {
                name: 'status',
                type: 'string',
                defaultValue: 'Issued'
            },
            {
                name: 'survey_type',
                type: 'string'
            },
            {
                name: 'transfer_status',
                type: 'string'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            }
        ],

        validations: [
            {
                type: 'presence',
                field: 'survey_id'
            },
            {
                type: 'format',
                field: 'survey_id',
                matcher: /^[a-zA-z0-9\u4E00-\u9FA5 \-:\.]+$/,
                message: LocaleManager.getLocalizedString(' can only consist of alpha-numeric characters.',
                    'Space.model.SpaceSurvey')
            },
            {
                type: 'presence',
                field: 'description'
            }
        ]
    }
});