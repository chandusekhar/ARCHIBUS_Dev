Ext.define('MaterialInventory.store.MaterialData', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.MaterialData'],

    serverTableName: 'msds_data',

    serverFieldNames: ['msds_id', 'product_name', 'manufacturer_id', 'ghs_id'],
    inventoryKeyNames: ['msds_id'],

    config: {
        model: 'MaterialInventory.model.MaterialData',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Material Data', 'MaterialInventory.store.MaterialData'),
        sorters: [
            {
                property: 'product_name',
                direction: 'ASC'
            }
        ],
        storeId: 'materialData',
        enableAutoLoad: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        }

    }
});