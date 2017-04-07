Ext.define('Common.store.IncidentInjuryAreas', {
    extend : 'Common.store.sync.ValidatingTableStore',
    requires : [ 'Common.model.IncidentInjuryArea' ],

    serverTableName : 'ehs_incident_injury_areas',

    serverFieldNames : [ 'injury_area_id', 'description' ],
    inventoryKeyNames : [ 'injury_area_id' ],

    config : {
        model : 'Common.model.IncidentInjuryArea',
        storeId : 'incidentInjuryAreasStore',
        remoteSort : true,
        remoteFilter : true,
        sorters : [ {
            property : 'injury_area_id',
            direction : 'ASC'
        } ],
        enableAutoLoad : true,
        proxy : {
            type : 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Injury Areas', 'Common.store.IncidentInjuryAreas')
    }
});