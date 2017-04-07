Ext.define('ConditionAssessment.store.AssessmentBuildings', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView'],

    config: {
        storeId: 'assessmentBuildingsStore',
        fields: [
            {name: 'site_id', type: 'string'},
            {name: 'pr_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'name', type: 'string'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT site_id, pr_id, bl_id, name FROM Building WHERE EXISTS (SELECT site_id FROM ConditionAssessment WHERE ConditionAssessment.site_id = Building.site_id)',

            viewName: 'AssessmentBuilding',

            baseTables: ['Building', 'ConditionAssessment']
        }
    }
});