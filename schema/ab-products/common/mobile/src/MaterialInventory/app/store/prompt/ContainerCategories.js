Ext.define('MaterialInventory.store.prompt.ContainerCategories', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.prompt.ContainerCategory'],

    serverTableName: 'hazard_container_cat',

    serverFieldNames: ['container_cat', 'description'],
    inventoryKeyNames: ['container_cat'],

    config: {
        model: 'MaterialInventory.model.prompt.ContainerCategory',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Container Categories', 'MaterialInventory.store.prompt.ContainerCategories'),
        sorters: [
            {
                property: 'container_cat',
                direction: 'ASC'
            }
        ],
        storeId: 'containerCategories',
        enableAutoLoad: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        },
        restriction: [
            {
                tableName: 'hazard_container_cat',
                fieldName: 'activity_id',
                operation: 'EQUALS',
                value: 'AbRiskMSDS'
            }
        ]
    }
});