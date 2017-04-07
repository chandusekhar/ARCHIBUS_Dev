Ext.define('ConditionAssessment.store.ProblemDescriptions', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Common.model.ProblemDescription'],

    serverTableName: 'pd',
    serverFieldNames: ['pd_id', 'pd_description'],
    inventoryKeyNames: ['pd_id'],

    config: {
        model: 'Common.model.ProblemDescription',
        sorters: [
            {
                property: 'pd_id',
                direction: 'ASC'
            }
        ],
        storeId: 'problemDescriptionsStore',
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Problem Descriptions', 'ConditionAssessment.store.ProblemDescriptions')
    }
});
