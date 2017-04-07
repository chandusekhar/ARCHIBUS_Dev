Ext.define('Space.store.SpaceSurveys', {
    extend: 'Common.store.sync.SyncStore',
    requires: [ 'Space.model.SpaceSurvey' ],

    serverTableName: 'surveymob_sync',
    serverFieldNames: [
        'survey_id',
        'description',
        'status',
        'survey_type',
        'survey_date',
        'em_id',
        'mob_locked_by',
        'mob_is_changed'
    ],

    inventoryKeyNames: [ 'survey_id' ],

    config: {
        model: 'Space.model.SpaceSurvey',
        storeId: 'spaceSurveysStore',
        remoteFilter: true,
        remoteSort: true,
        enableAutoLoad: true,
        tableDisplayName: LocaleManager.getLocalizedString('Surveys', 'Space.store.SpaceSurveys'),
        proxy: {
            type: 'Sqlite'
        }
    }
});