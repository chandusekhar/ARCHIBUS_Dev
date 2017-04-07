Ext.define('IncidentReporting.model.IncidentWitness', {
    extend: 'Common.data.Model',

    requires: [ 'IncidentReporting.model.Validation' ],

    config: {
        fields: [
            { name: 'id', type: 'int' },
            { name: 'witness_type', type: 'string' },
            { name: 'em_id', type: 'string' },
            { name: 'contact_id', type: 'string' },
            { name: 'non_em_name', type: 'string' },
            { name: 'non_em_info', type: 'string' },
            { name: 'information', type: 'string' },
            { name: 'mob_is_changed', type: 'IntegerClass' },
            { name: 'mob_locked_by', type: 'string' },
            { name: 'mob_incident_id', type: 'IntegerClass' }
        ],
        validations: [
            { type: 'presence', field: 'witness_type' },
            { type: 'presence', field: 'information' }
        ],
        customValidations: [
            {
                fields: [ 'witness_type', 'em_id', 'contact_id', 'non_em_name' ],
                type: 'witnessTypeMatch',
                message: LocaleManager.getLocalizedString('You must complete one and only one of these fields: {1}, {2}, {3}.  Enter the {1} if {0} is Employee, else {2} or {3} if {0} is Non-Employee.',
                    'IncidentReporting.model.IncidentWitness'),
                formatted: true
            }
        ]
    }
});