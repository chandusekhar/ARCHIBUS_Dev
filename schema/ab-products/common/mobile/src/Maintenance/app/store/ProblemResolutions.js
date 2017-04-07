Ext.define('Maintenance.store.ProblemResolutions', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.ProblemResolution'],

    serverTableName: 'pr',
    serverFieldNames: ['pr_id', 'pr_description'],
    inventoryKeyNames: ['pr_id'],

    config: {
        model: 'Maintenance.model.ProblemResolution',
        sorters: [
            {
                property: 'pr_id',
                direction: 'ASC'
            }
        ],
        storeId: 'problemResolutionsStore',
        tableDisplayName: LocaleManager.getLocalizedString('Problem Resolutions', 'Maintenance.store.ProblemResolutions'),
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});