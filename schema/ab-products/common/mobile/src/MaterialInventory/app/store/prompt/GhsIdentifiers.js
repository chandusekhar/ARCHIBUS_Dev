Ext.define('MaterialInventory.store.prompt.GhsIdentifiers', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.prompt.GhsIdentifier'
    ],

    config: {
        storeId: 'ghsIdentifiers',
        model: 'MaterialInventory.model.prompt.GhsIdentifier',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT ghs_id FROM MaterialData WHERE ghs_id IS NOT NULL',
            viewName: 'GhsIdentifier',

            baseTables: ['MaterialData']
        }
    }
});