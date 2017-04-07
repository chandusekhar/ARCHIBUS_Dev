Ext.define('Maintenance.model.manager.WorkRequestTool', {
    extend: 'Common.data.Model',

    requires: ['Maintenance.model.Validation'],

    config: {
        disableValidation: false,

        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'tool_id',
                type: 'string'
            },
            {
                name: 'wr_id',
                type: 'IntegerClass'
            },
            {
                name: 'date_assigned',
                type: 'DateClass',
                defaultValue: new Date()
            },
            {
                name: 'time_assigned',
                type: 'TimeClass',
                defaultValue: new Date()
            },
            {
                name: 'hours_est',
                type: 'float',
                defaultValue: 0.00
            },
            {
                name: 'date_start',
                type: 'DateClass'
            },
            {
                name: 'time_start',
                type: 'TimeClass'
            },
            {
                name: 'date_end',
                type: 'DateClass'
            },
            {
                name: 'time_end',
                type: 'TimeClass'
            },
            {
                name: 'hours_straight',
                type: 'float',
                defaultValue: 0.00
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass',
                defaultValue: 0
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },

            {
                name: 'mob_wr_id',
                type: 'IntegerClass'
            }
        ],

        validations: [
            {
                field: 'tool_id',
                type: 'presence'
            }
        ],

        customValidations: [
            {
                fields: ['date_start', 'time_start', 'date_end', 'time_end'],
                type: 'toolDates',
                message: LocaleManager.getLocalizedString(' {0} and {1} must be before {2} and {3}',
                    'Maintenance.model.manager.WorkRequestTool'),
                formatted: true
            }
        ]
    }
});