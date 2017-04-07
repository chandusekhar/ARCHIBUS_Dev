Ext.define('ConditionAssessment.store.AssessmentProjects', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView', 'ConditionAssessment.model.AssessmentProject', 'Common.model.Project'],

    config: {
        storeId: 'assessmentProjectsStore',
        model: 'ConditionAssessment.model.AssessmentProject',
        fields: [
            {name: 'project_id', type: 'string'},
            {name: 'project_type', type: 'string'},
            {name: 'date_created', type: 'date'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT DISTINCT c.project_id project_id, p.project_type project_type, p.date_created date_created FROM ConditionAssessment c'
            + ' left join Project p on c.project_id = p.project_id WHERE c.activity_type = \'ASSESSMENT\' OR c.activity_type LIKE \'CX%\'',

            viewName: 'AssessmentProject',

            baseTables: ['ConditionAssessment']
        },
        sorters: [
            {property: 'project_id', direction: 'ASC'}
        ]
    }
});