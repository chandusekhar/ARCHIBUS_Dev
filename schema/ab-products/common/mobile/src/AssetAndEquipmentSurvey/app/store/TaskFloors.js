Ext.define('AssetAndEquipmentSurvey.store.TaskFloors', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['AssetAndEquipmentSurvey.model.TaskFloor'],

    config: {
        storeId: 'taskFloorsStore',
        model: 'AssetAndEquipmentSurvey.model.TaskFloor',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT survey_id,bl_id,fl_id FROM Task',
            viewName: 'TaskFloor',
            baseTables: ['Task'],
            usesTransactionTable: true
        }
    }
});