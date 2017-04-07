Ext.define('Common.store.SchemaPreferences', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [
        'Common.model.SchemaPreference'
    ],

    serverTableName: 'afm_scmpref',

    serverFieldNames: ['units', 'base_metric_units'],
    inventoryKeyNames: ['afm_scmpref'],

    config: {
        model: 'Common.model.SchemaPreference',
        storeId: 'schemaPreferencesStore',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: ' ', // Not localized, LocaleManager does not load fast enough to localize this string.
        enableAutoLoad: false, // Enabled after initial load in Common.Application
        proxy: {
            type: 'Sqlite'
        }
    }
});