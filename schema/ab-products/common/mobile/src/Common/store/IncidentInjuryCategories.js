Ext.define('Common.store.IncidentInjuryCategories', {
    extend : 'Common.store.sync.ValidatingTableStore',
    requires : [ 'Common.model.IncidentInjuryCategory' ],

    serverTableName : 'ehs_incident_injury_cat',

    serverFieldNames : [ 'injury_category_id', 'description' ],
    inventoryKeyNames : [ 'injury_category_id' ],

    config : {
        model : 'Common.model.IncidentInjuryCategory',
        storeId : 'incidentInjuryCategoriesStore',
        remoteSort : true,
        remoteFilter : true,
        sorters : [ {
            property : 'injury_category_id',
            direction : 'ASC'
        } ],
        enableAutoLoad : true,
        proxy : {
            type : 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Injury Categories', 'Common.store.IncidentInjuryCategories')
    }
});