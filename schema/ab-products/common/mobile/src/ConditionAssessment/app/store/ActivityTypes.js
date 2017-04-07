Ext.define('ConditionAssessment.store.ActivityTypes', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['ConditionAssessment.model.ActivityType'],

    serverTableName: 'activitytype',
    serverFieldNames: ['activity_type'],
    inventoryKeyNames: ['activity_type'],

    config: {
        model: 'ConditionAssessment.model.ActivityType',
        sorters: [
            {
                property: 'activity_type',
                direction: 'ASC'
            }
        ],
        storeId: 'activityTypesStore',
        enableAutoLoad: true,
        disablePaging: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});
