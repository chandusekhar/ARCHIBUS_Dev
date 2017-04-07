Ext.define('IncidentReporting.store.Incidents', {
    extend: 'Common.store.sync.SyncStore',
    requires: 'IncidentReporting.model.Incident',

    serverTableName: 'ehs_incidents_sync',
    serverFieldNames: [
        'em_id_affected',
        'date_incident',
        'time_incident',
        'incident_type',
        'reported_by',
        'contact_id',
        'non_em_name',
        'non_em_info',
        'site_id',
        'pr_id',
        'bl_id',
        'fl_id',
        'rm_id',
        'injury_category_id',
        'injury_area_id',
        'emergency_rm_treatment',
        'is_hospitalized',
        'date_death',
        'description',
        'parent_incident_id',
        'mob_is_changed',
        'mob_locked_by',
        'mob_incident_id'
    ],
    inventoryKeyNames: [
        'em_id_affected',
        'non_em_name',
        'contact_id',
        'date_incident',
        'incident_type',
        'injury_category_id',
        'injury_area_id',
        'emergency_rm_treatment',
        'is_hospitalized',
        'date_death'
    ],
    config: {
        model: 'IncidentReporting.model.Incident',
        storeId: 'incidentsStore',
        sorters: [
            {
                property: 'parent_incident_id',
                direction: 'ASC'
            },
            {
                property: 'mob_incident_id',
                direction: 'ASC'
            }
        ],
        autoSync: true,
        remoteFilter: true,
        remoteSort: true,
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});