Ext.define('ConditionAssessment.store.AssessmentFloors', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView'],

    config: {
        storeId: 'assessmentFloorsStore',
        fields: [
            {name: 'site_id', type: 'string'},
            {name: 'pr_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'fl_id', type: 'string'},
            {name: 'name', type: 'string'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT bl.site_id, bl.pr_id, f.bl_id, f.fl_id, f.name'
            + ' FROM Floor f JOIN Building bl ON f.bl_id = bl.bl_id'
            + ' WHERE EXISTS (SELECT site_id FROM ConditionAssessment WHERE ConditionAssessment.site_id = bl.site_id)',

            viewName: 'AssessmentFloor',

            baseTables: ['Floor', 'Building', 'ConditionAssessment']
        }
    }
});