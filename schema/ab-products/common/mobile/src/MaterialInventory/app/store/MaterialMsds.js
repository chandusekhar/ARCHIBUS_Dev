Ext.define('MaterialInventory.store.MaterialMsds', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.MaterialMsds'],

    serverTableName: 'msds_data',

    serverFieldNames: ['msds_id', 'doc'],
    inventoryKeyNames: ['msds_id'],

    config: {
        model: 'MaterialInventory.model.MaterialMsds',
        remoteSort: true,
        remoteFilter: true,
        sorters: [
            {
                property: 'msds_id',
                direction: 'ASC'
            }
        ],
        storeId: 'materialMsds',
        enableAutoLoad: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Documents', 'MaterialInventory.store.MaterialMsds'),
        documentTable: 'msds_data',
        documentTablePrimaryKeyFields: ['msds_id']

    }
});