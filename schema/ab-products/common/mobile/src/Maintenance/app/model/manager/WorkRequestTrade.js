Ext.define('Maintenance.model.manager.WorkRequestTrade', {
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
                name: 'tr_id',
                type: 'string'
            },
            {
                name: 'wr_id',
                type: 'IntegerClass'
            },
            {
                name: 'hours_est',
                type: 'float',
                defaultValue: 0.00
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
                name: 'mob_is_changed',
                type: 'IntegerClass',
                defaultValue: 0
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            }
        ],

        validations: [
            {
                field: 'tr_id',
                type: 'presence'
            },
            {
                field: 'hours_est',
                type: 'presence'
            }
        ]
    }
});