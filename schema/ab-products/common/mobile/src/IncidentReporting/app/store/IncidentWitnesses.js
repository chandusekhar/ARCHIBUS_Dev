Ext.define('IncidentReporting.store.IncidentWitnesses', {
    extend: 'Common.store.sync.SyncStore',
    requires: [ 'IncidentReporting.model.IncidentWitness' ],

    serverTableName: 'ehs_incident_witness_sync',
    serverFieldNames: [ 'witness_type', 'em_id', 'contact_id', 'non_em_name',
        'non_em_info', 'information', 'mob_is_changed', 'mob_locked_by',
        'mob_incident_id' ],

    inventoryKeyNames: [ 'witness_type', 'em_id', 'non_em_name', 'contact_id',
        'mob_incident_id' ],

    config: {
        model: 'IncidentReporting.model.IncidentWitness',
        storeId: 'incidentWitnessesStore',
        remoteFilter: true,
        enableAutoLoad: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Witnesses', 'IncidentReporting.store.IncidentWitnesses')
    }
});