Ext.define('Common.store.IncidentTypes', {
    extend : 'Common.store.sync.ValidatingTableStore',
    requires : [ 'Common.model.IncidentType' ],

    serverTableName : 'ehs_incident_types',

    serverFieldNames : [ 'incident_type', 'description' ],
    inventoryKeyNames : [ 'incident_type' ],

    config : {
        model : 'Common.model.IncidentType',
        storeId : 'incidentTypesStore',
        remoteSort : true,
        remoteFilter : true,
        sorters : [ {
            property : 'incident_type',
            direction : 'ASC'
        } ],
        enableAutoLoad : true,
        proxy : {
            type : 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Incident Types', 'Common.store.IncidentTypes')
    }
});