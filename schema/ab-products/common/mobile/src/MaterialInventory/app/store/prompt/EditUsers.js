Ext.define('MaterialInventory.store.prompt.EditUsers', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.prompt.EditUser'
    ],

    config: {
        storeId: 'editUsers',
        model: 'MaterialInventory.model.prompt.EditUser',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT DISTINCT last_edited_by FROM MaterialLocation WHERE last_edited_by IS NOT NULL',
            viewName: 'EditUser',

            baseTables: ['MaterialLocation']
        }
    }
});