Ext.define('MaterialInventory.store.prompt.MaterialChemicals', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.prompt.MaterialChemical'],

    serverTableName: 'msds_chemical',

    serverFieldNames: ['chemical_id', 'tier2'],
    inventoryKeyNames: ['chemical_id'],

    config: {
        model: 'MaterialInventory.model.prompt.MaterialChemical',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Chemicals', 'MaterialInventory.store.prompt.MaterialChemicals'),
        sorters: [
            {
                property: 'chemical_id',
                direction: 'ASC'
            }
        ],
        storeId: 'materialChemicals',
        enableAutoLoad: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});