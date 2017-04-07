Ext.define('MaterialInventory.store.prompt.Manufacturers', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.prompt.Manufacturer'
    ],

    config: {
        storeId: 'manufacturers',
        model: 'MaterialInventory.model.prompt.Manufacturer',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT manufacturer_id FROM MaterialData WHERE manufacturer_id IS NOT NULL',
            viewName: 'Manufacturer',

            baseTables: ['MaterialData']
        }
    }
});