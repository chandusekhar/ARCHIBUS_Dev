Ext.define('SpaceOccupancy.model.EmployeeSurvey', {
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
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'email',
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
            },
            {
                name: 'phone',
                type: 'string'
            },
            {
                name: 'name_last',
                type: 'string'
            },
            {
                name: 'name_first',
                type: 'string'
            },
            {
                name: 'em_number',
                type: 'string'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'em_std',
                type: 'string'
            },
            {
                name: 'em_photo',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'em_photo_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'em_photo_file',
                type: 'string',
                defaultValue: '',
                isSyncField: false
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
            }
        ],

        validations: [
            {type: 'presence', field: 'em_id'}
        ]
    }
});