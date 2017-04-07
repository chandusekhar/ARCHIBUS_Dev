Ext.define('MaterialInventory.store.prompt.ContainerTypes', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.prompt.ContainerType'],

    serverTableName: 'hazard_container_type',

    serverFieldNames: ['container_cat', 'container_type', 'description'],
    inventoryKeyNames: ['container_cat', 'container_type'],

    config: {
        model: 'MaterialInventory.model.prompt.ContainerType',
        tableDisplayName: LocaleManager.getLocalizedString('Container Types', 'MaterialInventory.store.prompt.ContainerTypes'),
        remoteSort: true,
        remoteFilter: true,
        sorters: [
            {
                property: 'container_type',
                direction: 'ASC'
            }
        ],
        storeId: 'containerTypes',
        enableAutoLoad: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});