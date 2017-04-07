Ext.define('ConditionAssessment.store.AssessmentProjectFloors', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView', 'ConditionAssessment.model.AssessmentProjectFloor'],

    config: {
        storeId: 'projectFloorsStore',
        model: 'ConditionAssessment.model.AssessmentProjectFloor',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT DISTINCT c.project_id project_id, c.bl_id bl_id, c.fl_id fl_id, p.date_created date_created FROM ConditionAssessment c left join Project p on c.project_id = p.project_id '
            + ' WHERE ( activity_type = \'ASSESSMENT\' OR activity_type LIKE \'CX%\' ) ' + ' AND fl_id is not null ',

            viewName: 'AssessmentProjectFloors',

            baseTables: ['ConditionAssessment']
        },
        sorters: [
            {property: 'bl_id', direction: 'ASC'}
        ]
    }
});