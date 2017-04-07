Ext.define('Maintenance.store.ProblemDescriptions', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.ProblemDescription'],

    serverTableName: 'pd',
    serverFieldNames: ['pd_id', 'pd_description'],
    inventoryKeyNames: ['pd_id'],

    config: {
        model: 'Maintenance.model.ProblemDescription',
        sorters: [
            {
                property: 'pd_id',
                direction: 'ASC'
            }
        ],
        storeId: 'problemDescriptionsStore',
        tableDisplayName: LocaleManager.getLocalizedString('Problem Descriptions', 'Maintenance.store.ProblemDescriptions'),
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});
