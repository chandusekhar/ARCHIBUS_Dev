Ext.define('Questionnaire.store.Questionnaires', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Questionnaire.model.Questionnaire'],

    serverTableName: 'questionnaire',

    serverFieldNames: ['questionnaire_id', 'table_name', 'field_name', 'title', 'description'],
    inventoryKeyNames: ['questionnaire_id'],

    config: {
        model: 'Questionnaire.model.Questionnaire',
        storeId: 'questionnaires',
        remoteSort: true,
        remoteFilter: true,
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});