Ext.define('MaterialInventory.store.prompt.MaterialEmployees', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.prompt.MaterialEmployee'],

    serverTableName: 'em',

    serverFieldNames: ['em_id', 'bl_id'],
    inventoryKeyNames: ['em_id'],

    config: {
        model: 'MaterialInventory.model.prompt.MaterialEmployee',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Employees', 'MaterialInventory.store.MaterialEmployees'),
        sorters: [
            {
                property: 'em_id',
                direction: 'ASC'
            }
        ],
        storeId: 'materialEmployees',
        enableAutoLoad: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});