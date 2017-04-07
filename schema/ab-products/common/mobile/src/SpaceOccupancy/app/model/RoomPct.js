Ext.define('SpaceOccupancy.model.RoomPct', {
    extend: 'Common.data.Model',

    requires: ['SpaceOccupancy.model.Validation'],

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
                name: 'rm_cat',
                type: 'string'
            },
            {
                name: 'rm_type',
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
                name: 'primary_rm',
                type: 'IntegerClass'
            },
            {
                name: 'primary_em',
                type: 'IntegerClass'
            },
            {
                name: 'pct_space',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'date_start',
                type: 'date'
            },
            {
                name: 'date_end',
                type: 'date'
            },
            {
                name: 'status',
                type: 'IntegerClass'
            },
            {
                name: 'action',
                type: 'string',
                defaultValue: 'N/A'
            },
            {
                name: 'pct_id',
                type: 'string'
            },
            {
                name: 'activity_log_id',
                type: 'IntegerClass'
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
            },
            {
                name: 'type',
                type: 'string',
                isSyncField: false
            }
        ],

        customValidations: [
            {
                fields: 'pct_space',
                type: 'isNumericValue',
                message: LocaleManager.getLocalizedString('The value of Percentage Split needs to be numeric.',
                    'SpaceOccupancy.model.RoomPct'),
                formatted: true
            },
            {
                fields: 'pct_space',
                type: 'isBigEnoughPctSpace',
                message: LocaleManager.getLocalizedString('The value of Percentage Split cannot be negative.',
                    'SpaceOccupancy.model.RoomPct'),
                formatted: true
            },
            {
                fields: 'pct_space',
                type: 'isSmallEnoughPctSpace',
                message: LocaleManager.getLocalizedString('The value of Percentage Split cannot be bigger than 100.',
                    'SpaceOccupancy.model.RoomPct'),
                formatted: true
            },
            {
                fields: ['date_start', 'date_end'],
                type: 'isDateEndValid',
                message: LocaleManager.getLocalizedString('{0} must be after {1}.',
                    'SpaceOccupancy.model.RoomPct'),
                formatted: true
            }
        ]
    }

});