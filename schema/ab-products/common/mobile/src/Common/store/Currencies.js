Ext.define('Common.store.Currencies', {
    extend : 'Common.store.sync.ValidatingTableStore',
    requires : [ 'Common.model.Currency' ],

    serverTableName : 'afm_currencies',

    serverFieldNames : [ 'currency_id', 'currency_symbol'],
    inventoryKeyNames : [ 'currency_id' ],

    config : {
        model : 'Common.model.Currency',
        storeId : 'currenciesStore',
        remoteSort : true,
        remoteFilter : true,
        enableAutoLoad : false, // Enabled after initial load in Common.Application
        proxy : {
            type : 'Sqlite'
        },
        tableDisplayName: ' '  // Not translated
    }
});