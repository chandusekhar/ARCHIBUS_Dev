Ext.define('MaterialInventory.store.prompt.Custodians', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.prompt.Custodian'
    ],

    config: {
        storeId: 'custodians',
        model: 'MaterialInventory.model.prompt.Custodian',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT custodian_id FROM MaterialLocation WHERE custodian_id IS NOT NULL',
            viewName: 'Custodian',

            baseTables: ['MaterialLocation']
        }
    }
});