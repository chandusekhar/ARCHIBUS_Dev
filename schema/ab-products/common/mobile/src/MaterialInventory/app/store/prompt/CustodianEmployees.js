Ext.define('MaterialInventory.store.prompt.CustodianEmployees', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.prompt.CustodianEmployee'
    ],

    config: {
        storeId: 'custodianEmployees',
        model: 'MaterialInventory.model.prompt.CustodianEmployee',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT custodian_id FROM (SELECT custodian_id FROM Custodian ' +
            'UNION SELECT em_id AS custodian_id FROM MaterialEmployee)',
            viewName: 'CustodianEmployee',

            baseTables: ['Custodian', 'MaterialEmployee']
        }
    }
});