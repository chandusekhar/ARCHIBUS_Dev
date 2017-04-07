Ext.define('ConditionAssessment.store.AssessmentProjectFloorRooms', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView', 'ConditionAssessment.model.AssessmentProjectFloorRoom'],

    config: {
        storeId: 'projectFloorRoomsStore',
        model: 'ConditionAssessment.model.AssessmentProjectFloorRoom',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT DISTINCT project_id, bl_id, fl_id, rm_id FROM ConditionAssessment'
            + ' WHERE ( activity_type = \'ASSESSMENT\' OR activity_type LIKE \'CX%\' ) ' + ' AND fl_id is not null AND rm_id is not null ',

            viewName: 'AssessmentProjectFloorRooms',

            baseTables: ['ConditionAssessment']
        },
        sorters: [
            {property: 'bl_id', direction: 'ASC'}
        ]
    }
});