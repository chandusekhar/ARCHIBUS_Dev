Ext.define('IncidentReporting.model.Incident', {
    extend: 'Common.data.Model',

    config: {
        disableValidation: false,

        fields: [
            { name: 'id', type: 'int' },
            { name: 'em_id_affected', type: 'string' },
            { name: 'date_incident', type: 'DateClass' },
            { name: 'time_incident', type: 'TimeClass' },
            { name: 'incident_type', type: 'string' },
            { name: 'reported_by', type: 'string'},
            { name: 'contact_id', type: 'string'},
            { name: 'non_em_name', type: 'string'},
            { name: 'non_em_info', type: 'string'},
            { name: 'site_id', type: 'string' },
            { name: 'pr_id', type: 'string' },
            { name: 'bl_id', type: 'string' },
            { name: 'fl_id', type: 'string' },
            { name: 'rm_id', type: 'string' },
            { name: 'injury_category_id', type: 'string' },
            { name: 'injury_area_id', type: 'string' },
            { name: 'emergency_rm_treatment', type: 'IntegerClass', defaultValue: 0 },
            { name: 'is_hospitalized', type: 'IntegerClass', defaultValue: 0 },
            { name: 'date_death', type: 'DateClass' },
            { name: 'description', type: 'string' },
            { name: 'parent_incident_id', type: 'IntegerClass' },
            { name: 'mob_is_changed', type: 'IntegerClass' },
            { name: 'mob_locked_by', type: 'string' },
            { name: 'mob_incident_id', type: 'IntegerClass' }
        ],
        validations: [
            { type: 'presence', field: 'date_incident' },
            { type: 'presence', field: 'incident_type' }
        ],

        customValidations: [
            {
                fields: [ 'em_id_affected', 'contact_id', 'non_em_name' ],
                type: 'personNameInserted',
                message: LocaleManager.getLocalizedString('You must complete one and only one of these fields: {0}, {1} or {2}.',
                    'IncidentReporting.model.Incident'),
                formatted: true
            },
            {
                fields: [ 'date_incident'],
                type: 'dateInFuture',
                message: LocaleManager.getLocalizedString("You can't create an Incident supposed to occur in the future. Please change the {0}.",
                    'IncidentReporting.model.Incident'),
                formatted: true
            },
            {
                fields: [ 'date_death'],
                type: 'dateInFuture',
                message: LocaleManager.getLocalizedString("You can't set a future date for {0}. Please change the {0}.",
                    'IncidentReporting.model.Incident'),
                formatted: true
            }
        ]
    }
});