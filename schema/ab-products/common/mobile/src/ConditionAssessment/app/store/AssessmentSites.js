Ext.define('ConditionAssessment.store.AssessmentSites', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView', 'ConditionAssessment.model.AssessmentSite'],

    config: {
        storeId: 'assessmentSitesStore',
        model: 'ConditionAssessment.model.AssessmentSite',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT site_id, name FROM Site WHERE EXISTS (SELECT site_id FROM ConditionAssessment WHERE ConditionAssessment.site_id = Site.site_id)',

            viewName: 'AssessmentSite',

            baseTables: ['Site', 'ConditionAssessment']
        }
    }
});