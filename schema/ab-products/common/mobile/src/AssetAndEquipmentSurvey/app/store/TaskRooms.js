Ext.define('AssetAndEquipmentSurvey.store.TaskRooms', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['AssetAndEquipmentSurvey.model.TaskRoom'],

    config: {
        storeId: 'taskRoomsStore',
        model: 'AssetAndEquipmentSurvey.model.TaskRoom',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT DISTINCT survey_id,bl_id,fl_id,rm_id FROM Task',

            viewName: 'TaskRoom',

            baseTables: [ 'Task' ],

            usesTransactionTable: true
        }
    }
});