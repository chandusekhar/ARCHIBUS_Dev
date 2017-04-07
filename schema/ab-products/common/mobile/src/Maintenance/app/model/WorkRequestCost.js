Ext.define('Maintenance.model.WorkRequestCost', {
    extend: 'Common.data.Model',

    requires: 'Common.data.Validations',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'wr_id',
                type: 'IntegerClass'
            },
            {
                name: 'date_used',
                type: 'DateClass'
            },
            {
                name: 'other_rs_type',
                type: 'string'
            },
            {
                name: 'cost_estimated',
                type: 'float'
            },
            {
                name: 'cost_total',
                type: 'float'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'qty_used',
                type: 'float'
            },
            {
                name: 'units_used',
                type: 'string'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
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
                type: 'presence',
                field: 'date_used'
            },
            {
                type: 'presence',
                field: 'other_rs_type'
            },
            {
                type: 'presence',
                field: 'cost_total'
            },
            {
                type: 'format',
                field: 'cost_total',
                matcher: new RegExp('^[0-9]+$|^[0-9]+.[0-9]$|^[0-9]+.[0-9][0-9]$')
            },
            {
                type: 'maxvalue',
                field: 'cost_total',
                maxValue: 100000000,
                message: LocaleManager.getLocalizedString(' must be less than or equal to 100,000,000.',
                    'Maintenance.model.WorkRequestCost')
            },
            {
                type: 'minvalue',
                field: 'cost_total',
                minValue: 0,
                message: LocaleManager.getLocalizedString(' must be greater than or equal to 0.',
                    'Maintenance.model.WorkRequestCost')
            }
        ]
    }
});