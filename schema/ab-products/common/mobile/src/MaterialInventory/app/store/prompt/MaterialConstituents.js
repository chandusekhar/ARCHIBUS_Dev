Ext.define('MaterialInventory.store.prompt.MaterialConstituents', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.prompt.MaterialConstituent'],

    serverTableName: 'msds_constituent',

    serverFieldNames: ['msds_id', 'chemical_id'],
    inventoryKeyNames: ['msds_id', 'chemical_id'],

    config: {
        model: 'MaterialInventory.model.prompt.MaterialConstituent',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Constituents', 'MaterialInventory.store.prompt.MaterialConstituents'),
        sorters: [
            {
                property: 'chemical_id',
                direction: 'ASC'
            }
        ],
        storeId: 'materialConstituents',
        enableAutoLoad: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});